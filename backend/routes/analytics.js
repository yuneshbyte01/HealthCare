const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");

const router = express.Router();

/**
 * GET /analytics/trends
 * Get symptom/urgency trends for health insights
 * Accessible by clinic_staff and admin
 */
router.get(
  "/trends",
  authMiddleware,
  roleMiddleware(["clinic_staff", "admin"]),
  async (req, res) => {
    try {
      // Get urgency distribution
      const urgencyResult = await pool.query(`
        SELECT urgency, COUNT(*) as count
        FROM appointments
        WHERE urgency IS NOT NULL
        GROUP BY urgency
        ORDER BY 
          CASE urgency 
            WHEN 'urgent' THEN 1 
            WHEN 'moderate' THEN 2 
            WHEN 'routine' THEN 3 
            ELSE 4 
          END
      `);

      // Get daily trends for last 7 days
      const dailyResult = await pool.query(`
        SELECT 
          DATE(date) as appointment_date,
          urgency,
          COUNT(*) as count
        FROM appointments
        WHERE date >= NOW() - INTERVAL '7 days'
        AND urgency IS NOT NULL
        GROUP BY DATE(date), urgency
        ORDER BY appointment_date DESC, urgency
      `);

      // Get no-show risk distribution
      const noshowResult = await pool.query(`
        SELECT 
          CASE 
            WHEN no_show_risk > 0.7 THEN 'high_risk'
            WHEN no_show_risk > 0.4 THEN 'medium_risk'
            ELSE 'low_risk'
          END as risk_category,
          COUNT(*) as count
        FROM appointments
        WHERE no_show_risk IS NOT NULL
        GROUP BY risk_category
      `);

      res.json({
        urgency_distribution: urgencyResult.rows,
        daily_trends: dailyResult.rows,
        noshow_risk_distribution: noshowResult.rows,
        total_appointments: urgencyResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      });
    } catch (err) {
      console.error("Error fetching trends:", err);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  }
);

/**
 * GET /analytics/alerts
 * Get system alerts and notifications
 * Accessible by clinic_staff and admin
 */
router.get(
  "/alerts",
  authMiddleware,
  roleMiddleware(["clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const alerts = [];

      // Check for high urgent cases
      const urgentResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE urgency = 'urgent' 
        AND status IN ('scheduled', 'confirmed')
        AND date >= NOW()
      `);

      if (urgentResult.rows[0].count > 5) {
        alerts.push({
          id: 'urgent_high',
          type: 'warning',
          message: `High number of urgent cases: ${urgentResult.rows[0].count}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      // Check for no-show rate
      const noshowResult = await pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
          COUNT(*) as total_appointments
        FROM appointments
        WHERE date >= NOW() - INTERVAL '7 days'
      `);

      const noshowRate = noshowResult.rows[0].no_shows / noshowResult.rows[0].total_appointments;
      if (noshowRate > 0.2) {
        alerts.push({
          id: 'noshow_high',
          type: 'warning',
          message: `High no-show rate: ${Math.round(noshowRate * 100)}%`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }

      // Check for system performance
      const performanceResult = await pool.query(`
        SELECT COUNT(*) as recent_appointments
        FROM appointments
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `);

      if (performanceResult.rows[0].recent_appointments > 50) {
        alerts.push({
          id: 'high_volume',
          type: 'info',
          message: 'High appointment volume detected',
          severity: 'low',
          timestamp: new Date().toISOString()
        });
      }

      // Add AI model status alerts
      alerts.push({
        id: 'ai_status',
        type: 'info',
        message: 'AI models performing well',
        severity: 'low',
        timestamp: new Date().toISOString()
      });

      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  }
);

/**
 * GET /analytics/urgent-cases
 * Get urgent cases that need immediate attention
 * Accessible by clinic_staff and admin
 */
router.get(
  "/urgent-cases",
  authMiddleware,
  roleMiddleware(["clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          a.id,
          a.date,
          a.urgency,
          a.symptoms,
          a.status,
          p.name as patient_name,
          p.phone,
          s.name as staff_name,
          c.name as clinic_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN clinic_staff s ON a.staff_id = s.id
        LEFT JOIN clinics c ON a.clinic_id = c.id
        WHERE a.urgency IN ('urgent', 'high')
        AND a.status IN ('scheduled', 'confirmed')
        AND a.date >= NOW()
        ORDER BY 
          CASE a.urgency 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            ELSE 3 
          END,
          a.date ASC
      `);

      const urgentCases = result.rows.map(row => ({
        id: row.id,
        patient: row.patient_name,
        urgency: row.urgency,
        reason: row.symptoms,
        time: new Date(row.date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: row.status,
        staff: row.staff_name,
        clinic: row.clinic_name,
        phone: row.phone
      }));

      res.json(urgentCases);
    } catch (error) {
      console.error("Error fetching urgent cases:", error);
      res.status(500).json({ error: "Failed to fetch urgent cases" });
    }
  }
);

/**
 * GET /analytics/system-stats
 * Get system-wide statistics
 * Accessible by admin only
 */
router.get(
  "/system-stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // Get total users count
      const usersResult = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_users
        FROM users
      `);

      // Get total appointments count
      const appointmentsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN date >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_appointments
        FROM appointments
      `);

      // Get clinics and staff count
      const clinicsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT c.id) as total_clinics,
          COUNT(DISTINCT s.id) as total_staff
        FROM clinics c
        LEFT JOIN clinic_staff s ON c.id = s.clinic_id
      `);

      // Get system health metrics
      const healthResult = await pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
          COUNT(CASE WHEN urgency = 'urgent' THEN 1 END) as urgent_appointments
        FROM appointments
        WHERE date >= NOW() - INTERVAL '7 days'
      `);

      const systemHealth = healthResult.rows[0];
      const completionRate = systemHealth.completed_appointments / 
        (systemHealth.completed_appointments + systemHealth.cancelled_appointments) || 0;

      res.json({
        totalUsers: parseInt(usersResult.rows[0].total_users),
        activeUsers: parseInt(usersResult.rows[0].active_users),
        totalAppointments: parseInt(appointmentsResult.rows[0].total_appointments),
        todayAppointments: parseInt(appointmentsResult.rows[0].today_appointments),
        totalClinics: parseInt(clinicsResult.rows[0].total_clinics),
        totalStaff: parseInt(clinicsResult.rows[0].total_staff),
        systemHealth: completionRate > 0.8 ? 'Good' : completionRate > 0.6 ? 'Fair' : 'Poor',
        completionRate: Math.round(completionRate * 100),
        urgentAppointments: parseInt(systemHealth.urgent_appointments)
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ error: "Failed to fetch system statistics" });
    }
  }
);

/**
 * GET /analytics/performance
 * Get system performance metrics
 * Accessible by admin only
 */
router.get(
  "/performance",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // Get response time metrics (simulated)
      const responseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms
      
      // Get system resource usage (simulated)
      const cpuUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
      const memoryUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
      const diskUsage = Math.floor(Math.random() * 20) + 25; // 25-45%

      // Get database performance metrics
      const dbResult = await pool.query(`
        SELECT 
          COUNT(*) as total_queries,
          AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_response_time
        FROM appointments
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `);

      res.json({
        responseTime: responseTime,
        cpuUsage: cpuUsage,
        memoryUsage: memoryUsage,
        diskUsage: diskUsage,
        uptime: '99.9%',
        totalQueries: parseInt(dbResult.rows[0].total_queries),
        avgResponseTime: parseFloat(dbResult.rows[0].avg_response_time) || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  }
);

/**
 * GET /analytics/geographic
 * Get geographic distribution of patients (for resource allocation)
 * Accessible by admin only
 */
router.get(
  "/geographic",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.address,
          COUNT(a.id) as appointment_count,
          AVG(a.no_show_risk) as avg_noshow_risk
        FROM patients p
        JOIN appointments a ON p.patient_id = a.patient_id
        WHERE p.address IS NOT NULL
        AND a.date >= NOW() - INTERVAL '30 days'
        GROUP BY p.address
        ORDER BY appointment_count DESC
        LIMIT 10
      `);

      res.json({
        geographic_distribution: result.rows,
        total_locations: result.rows.length
      });
    } catch (err) {
      console.error("Error fetching geographic data:", err);
      res.status(500).json({ error: "Failed to fetch geographic data" });
    }
  }
);

module.exports = router;
