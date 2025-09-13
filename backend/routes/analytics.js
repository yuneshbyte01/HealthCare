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
 * Generate health alerts based on urgent cases and patterns
 * Accessible by clinic_staff and admin
 */
router.get(
  "/alerts",
  authMiddleware,
  roleMiddleware(["clinic_staff", "admin"]),
  async (req, res) => {
    try {
      // Weekly urgent case alert
      const urgentResult = await pool.query(`
        SELECT COUNT(*)::int AS urgent_count
        FROM appointments
        WHERE urgency = 'urgent'
        AND date > NOW() - INTERVAL '7 days'
      `);

      // High no-show risk alert
      const noshowResult = await pool.query(`
        SELECT COUNT(*)::int AS high_risk_count
        FROM appointments
        WHERE no_show_risk > 0.7
        AND date > NOW() - INTERVAL '7 days'
      `);

      // Capacity utilization alert
      const capacityResult = await pool.query(`
        SELECT 
          c.name as clinic_name,
          c.capacity,
          COUNT(a.id) as current_appointments
        FROM clinics c
        LEFT JOIN appointments a ON c.clinic_id = a.clinic_id
        WHERE a.date >= NOW() - INTERVAL '7 days'
        GROUP BY c.clinic_id, c.name, c.capacity
        HAVING COUNT(a.id) > c.capacity * 0.8
      `);

      const urgentCases = urgentResult.rows[0].urgent_count;
      const highRiskNoshow = noshowResult.rows[0].high_risk_count;
      const capacityAlerts = capacityResult.rows;

      let alerts = [];

      // Urgent cases alert
      if (urgentCases > 10) {
        alerts.push({
          type: "urgent_cases",
          severity: "high",
          message: `⚠️ High number of urgent cases detected this week: ${urgentCases}`,
          count: urgentCases,
          threshold: 10
        });
      } else if (urgentCases > 5) {
        alerts.push({
          type: "urgent_cases",
          severity: "medium",
          message: `⚠️ Moderate number of urgent cases this week: ${urgentCases}`,
          count: urgentCases,
          threshold: 5
        });
      }

      // No-show risk alert
      if (highRiskNoshow > 5) {
        alerts.push({
          type: "noshow_risk",
          severity: "medium",
          message: `📊 High no-show risk detected: ${highRiskNoshow} appointments at risk`,
          count: highRiskNoshow,
          threshold: 5
        });
      }

      // Capacity alerts
      capacityAlerts.forEach(clinic => {
        alerts.push({
          type: "capacity",
          severity: "medium",
          message: `🏥 ${clinic.clinic_name} at ${Math.round((clinic.current_appointments / clinic.capacity) * 100)}% capacity`,
          clinic: clinic.clinic_name,
          utilization: Math.round((clinic.current_appointments / clinic.capacity) * 100)
        });
      });

      res.json({
        alerts,
        summary: {
          urgent_cases_this_week: urgentCases,
          high_risk_noshow: highRiskNoshow,
          capacity_alerts: capacityAlerts.length
        }
      });
    } catch (err) {
      console.error("Error fetching alerts:", err);
      res.status(500).json({ error: "Failed to fetch alerts" });
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

/**
 * GET /analytics/performance
 * Get AI model performance metrics
 * Accessible by admin only
 */
router.get(
  "/performance",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // Get AI prediction accuracy (simplified - in real system, you'd track actual outcomes)
      const aiResult = await pool.query(`
        SELECT 
          urgency,
          AVG(no_show_risk) as avg_noshow_risk,
          COUNT(*) as count
        FROM appointments
        WHERE urgency IS NOT NULL
        AND no_show_risk IS NOT NULL
        AND date >= NOW() - INTERVAL '30 days'
        GROUP BY urgency
      `);

      res.json({
        ai_performance: aiResult.rows,
        model_status: {
          triage_model: "active",
          noshow_model: "active",
          last_retrain: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error("Error fetching performance data:", err);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  }
);

module.exports = router;
