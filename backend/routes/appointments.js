const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth"); // estructured import
const roleMiddleware = require("../middleware/role");     // role-based access
const Log = require("../models/Log");
const axios = require("axios");

const router = express.Router();

// Test endpoint for AI integration (no auth required)
router.post("/test-ai", async (req, res) => {
  try {
    const { symptoms, patient_id, date } = req.body;
    
    let urgency = 'routine';
    let noShowRisk = 0.5;

    try {
      // --- Call NLP-based triage service (supports multilingual symptoms) ---
      const triageRes = await axios.post("http://localhost:6000/nlp-triage", {
        age: 65, // Default age - can be enhanced to get from patient profile
        symptoms: symptoms || ""
      });
      urgency = triageRes.data.urgency;
      console.log("NLP Triage response:", triageRes.data);
    } catch (aiError) {
      console.warn("NLP triage service unavailable:", aiError.message);
    }

    try {
      // --- Call ML-based no-show predictor ---
      const noshowRes = await axios.post("http://localhost:6000/noshow-ml", {
        age: 65, // Default age - can be enhanced to get from patient profile
        distance: 10, // Default distance in km - can be enhanced with real location data
        history_missed: 0, // Default - can be enhanced to get from patient history
        weather_bad: 0 // Default - can be enhanced with real weather API
      });
      noShowRisk = noshowRes.data.no_show_risk;
      console.log("ML No-show response:", noshowRes.data);
    } catch (aiError) {
      console.warn("ML no-show service unavailable:", aiError.message);
    }

    res.json({
      message: "AI integration test successful",
      urgency,
      noShowRisk,
      symptoms,
      patient_id,
      date
    });
  } catch (err) {
    console.error("Error testing AI integration:", err.message);
    res.status(500).json({ error: "AI integration test failed", details: err.message });
  }
});

/**
 * POST /api/appointments
 * Patients book their own appointments.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["patient"]),
  async (req, res) => {
    try {
      const { date, staff_id, clinic_id, symptoms } = req.body;
      
      // Add debugging
      console.log("=== BOOKING APPOINTMENT ===");
      console.log("Request body:", req.body);
      console.log("Symptoms received:", symptoms);
      console.log("Symptoms type:", typeof symptoms);
      console.log("Symptoms length:", symptoms ? symptoms.length : 'null/undefined');
      
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }

      const patient_id = req.user.id;

      let urgency = 'routine';
      let noShowRisk = 0.5;

      try {
        // --- Call NLP-based triage service (supports multilingual symptoms) ---
        const triageRes = await axios.post("http://localhost:6000/nlp-triage", {
          age: 65, // Default age - can be enhanced to get from patient profile
          symptoms: symptoms || ""
        });
        urgency = triageRes.data.urgency;
        console.log("NLP Triage response:", triageRes.data);
      } catch (aiError) {
        console.warn("NLP triage service unavailable, trying fallback ML triage:", aiError.message);
        
        // Fallback to ML triage if NLP fails
        try {
          const fallbackRes = await axios.post("http://localhost:6000/ml-triage", {
            age: 65,
            fever: (symptoms || "").toLowerCase().includes("fever"),
            chestpain: (symptoms || "").toLowerCase().includes("chest pain")
          });
          urgency = fallbackRes.data.urgency;
          console.log("Fallback ML Triage response:", fallbackRes.data);
        } catch (fallbackError) {
          console.warn("Both NLP and ML triage services unavailable, using default urgency:", fallbackError.message);
        }
      }

      try {
        // --- Call ML-based no-show predictor ---
        const noshowRes = await axios.post("http://localhost:6000/noshow-ml", {
          age: 65, // Default age - can be enhanced to get from patient profile
          distance: 10, // Default distance in km - can be enhanced with real location data
          history_missed: 0, // Default - can be enhanced to get from patient history
          weather_bad: 0 // Default - can be enhanced with real weather API
        });
        noShowRisk = noshowRes.data.no_show_risk;
        console.log("ML No-show response:", noshowRes.data);
      } catch (aiError) {
        console.warn("ML no-show service unavailable, using default risk:", aiError.message);
      }

      console.log("Booking appointment for patient:", patient_id, "with AI data:", { urgency, noShowRisk });
      
      // AI Scheduling Logic
      let finalDate = date;
      let schedulingNotes = "";
      
      // If urgency = urgent → assign nearest free slot
      if (urgency === "urgent") {
        // For urgent cases, try to find the nearest available slot
        // This is simplified - in production, you'd query actual availability
        const urgentSlot = new Date(date);
        urgentSlot.setHours(urgentSlot.getHours() - 2); // Move 2 hours earlier
        finalDate = urgentSlot.toISOString();
        schedulingNotes = "Urgent case - prioritized scheduling";
        console.log("Urgent case detected - rescheduled to:", finalDate);
      }
      
      // If no_show_risk > 0.6 → mark for follow-up
      if (parseFloat(noShowRisk) > 0.6) {
        schedulingNotes += (schedulingNotes ? "; " : "") + "High no-show risk - follow-up recommended";
        console.log("High no-show risk detected:", noShowRisk);
      }
      
      // Auto-assign doctor based on urgency and availability
      let assignedStaffId = staff_id;
      let assignedClinicId = clinic_id;
      
      if (!assignedStaffId) {
        console.log("No staff assigned, finding best available doctor...");
        
        // Find available doctors based on urgency and current workload
        let doctorQuery = `
          SELECT cs.staff_id, u.name, cs.specialization, cs.experience_years, cs.clinic_id,
                 COUNT(a.id) as current_appointments
          FROM clinic_staff cs
          JOIN users u ON cs.staff_id = u.id
          LEFT JOIN appointments a ON cs.staff_id = a.staff_id 
            AND a.status = 'scheduled' 
            AND DATE(a.date) = DATE($1)
          WHERE cs.position = 'doctor'
        `;
        
        // Add specialization filter for urgent cases
        if (urgency === 'urgent') {
          doctorQuery += ` AND (cs.specialization ILIKE '%emergency%' OR cs.specialization ILIKE '%general%' OR cs.specialization IS NULL)`;
        }
        
        doctorQuery += ` 
          GROUP BY cs.staff_id, u.name, cs.specialization, cs.experience_years, cs.clinic_id
          ORDER BY current_appointments ASC, cs.experience_years DESC, u.name ASC 
          LIMIT 1`;
        
        try {
          const doctorResult = await pool.query(doctorQuery, [finalDate]);
          if (doctorResult.rows.length > 0) {
            assignedStaffId = doctorResult.rows[0].staff_id;
            assignedClinicId = doctorResult.rows[0].clinic_id;
            console.log("Auto-assigned doctor:", doctorResult.rows[0].name, "ID:", assignedStaffId, "Current appointments:", doctorResult.rows[0].current_appointments);
          } else {
            console.log("No doctors available, appointment will be unassigned");
          }
        } catch (error) {
          console.error("Error finding available doctor:", error);
        }
      }
      
      console.log("About to insert appointment with symptoms:", symptoms);
      console.log("Insert parameters:", [patient_id, assignedStaffId, assignedClinicId, finalDate, urgency, noShowRisk, symptoms]);
      
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, staff_id, clinic_id, date, urgency, no_show_risk, symptoms, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled') RETURNING *`,
        [patient_id, assignedStaffId, assignedClinicId, finalDate, urgency, noShowRisk, symptoms]
      );
      
      console.log("Appointment created successfully!");
      console.log("Created appointment:", result.rows[0]);
      console.log("Symptoms in created appointment:", result.rows[0].symptoms);

      // Log to MongoDB (optional - don't fail if MongoDB is down)
      try {
        await Log.create({
          action: "BOOKED",
          userId: patient_id,
          details: {
            appointment: result.rows[0],
            ai_results: {
              urgency: urgency,
              no_show_risk: noShowRisk
            }
          }
        });
      } catch (logError) {
        console.warn("MongoDB logging failed (appointment still created):", logError.message);
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error booking appointment:", err.message);
      console.error("Full error:", err);
      res.status(500).json({ error: "Failed to book appointment" });
    }
  }
);

/**
 * GET /api/appointments
 * - Patients see only their own appointments
 * - Clinic staff/admin see all appointments
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      let result;

      if (req.user.role === "patient") {
        console.log("Fetching appointments for patient ID:", req.user.id);
        result = await pool.query(
          "SELECT * FROM appointments WHERE patient_id=$1 ORDER BY date ASC",
          [req.user.id]
        );
        console.log("Patient appointments found:", result.rows.length);
      } else {
        console.log("Fetching all appointments for staff/admin");
        result = await pool.query("SELECT * FROM appointments ORDER BY date ASC");
        console.log("All appointments found:", result.rows.length);
      }

      // Log to MongoDB (optional)
      try {
        await Log.create({
          action: "FETCH_APPOINTMENTS",
          userId: req.user.id,
          role: req.user.role,
          details: { count: result.rows.length },
        });
      } catch (logError) {
        console.warn("MongoDB logging failed:", logError.message);
      }

      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

/**
 * POST /api/appointments/recommend
 * AI-powered appointment slot recommendation
 */
router.post(
  "/recommend",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const { patient_id, symptoms } = req.body;
      const userId = req.user.id;
      
      // Get AI triage assessment
      let urgency = 'routine';
      try {
        const triageRes = await axios.post("http://localhost:6000/ml-triage", {
          age: 65, // Default age - can be enhanced to get from patient profile
          fever: (symptoms || "").toLowerCase().includes("fever"),
          chestpain: (symptoms || "").toLowerCase().includes("chest pain")
        });
        urgency = triageRes.data.urgency;
      } catch (aiError) {
        console.warn("AI triage service unavailable for recommendation:", aiError.message);
      }
      
      // AI Scheduling Logic - Find optimal slot
      let recommendedSlot;
      const now = new Date();
      
      if (urgency === "urgent") {
        // For urgent cases, recommend next available slot (within 2 hours)
        recommendedSlot = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      } else if (urgency === "moderate") {
        // For moderate cases, recommend slot within 24 hours
        recommendedSlot = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      } else {
        // For routine cases, recommend slot within 3-7 days
        recommendedSlot = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
      }
      
      // Round to nearest hour
      recommendedSlot.setMinutes(0, 0, 0);
      
      // Check for conflicts (simplified - in production, query actual appointments)
      const existingAppointments = await pool.query(
        "SELECT COUNT(*) as count FROM appointments WHERE date = $1",
        [recommendedSlot.toISOString()]
      );
      
      if (existingAppointments.rows[0].count > 0) {
        // If slot is taken, find next available hour
        recommendedSlot.setHours(recommendedSlot.getHours() + 1);
      }
      
      const recommendation = {
        recommended_slot: recommendedSlot.toISOString(),
        urgency: urgency,
        reasoning: urgency === "urgent" ? "Urgent case - prioritized scheduling" :
                  urgency === "moderate" ? "Moderate urgency - scheduled within 24 hours" :
                  "Routine case - scheduled within 5 days",
        ai_confidence: urgency === "urgent" ? "high" : "medium"
      };
      
      // Log the recommendation (optional)
      try {
        await Log.create({
          action: "AI_RECOMMENDATION",
          userId: userId,
          details: {
            recommendation: recommendation,
            symptoms: symptoms,
            patient_id: patient_id
          }
        });
      } catch (logError) {
        console.warn("MongoDB logging failed:", logError.message);
      }
      
      res.json(recommendation);
    } catch (err) {
      console.error("Error generating AI recommendation:", err.message);
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  }
);

/**
 * PUT /api/appointments/:id
 * - Patients can update only their own appointments
 * - Staff/admin can update any appointment
 * - Supports updating date, status, or both
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const { date, status } = req.body;
      
      // Validate that at least one field is provided
      if (!date && !status) {
        return res.status(400).json({ error: "Date or status is required" });
      }

      // Build dynamic query based on provided fields
      let updateFields = [];
      let params = [];
      let paramIndex = 1;

      if (date) {
        updateFields.push(`date = $${paramIndex}`);
        params.push(date);
        paramIndex++;
      }

      if (status) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      let query = `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      params.push(req.params.id);

      if (req.user.role === "patient") {
        query = `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND patient_id = $${paramIndex + 1} RETURNING *`;
        params.push(req.user.id);
      }

      const result = await pool.query(query, params);

      if (!result.rows.length) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Log to MongoDB (optional)
      try {
        const action = date && status ? "UPDATED" : date ? "RESCHEDULED" : "STATUS_CHANGED";
        await Log.create({
          action: action,
          userId: req.user.id,
          role: req.user.role,
          details: { 
            appointment: result.rows[0],
            changes: { date, status }
          },
        });
      } catch (logError) {
        console.warn("MongoDB logging failed:", logError.message);
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating appointment:", err.message);
      res.status(500).json({ error: "Failed to update appointment" });
    }
  }
);

/**
 * DELETE /api/appointments/:id
 * - Patients can cancel only their own appointments
 * - Staff/admin can cancel any appointment
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      let query = "DELETE FROM appointments WHERE id=$1 RETURNING *";
      let params = [req.params.id];

      if (req.user.role === "patient") {
        query =
          "DELETE FROM appointments WHERE id=$1 AND patient_id=$2 RETURNING *";
        params = [req.params.id, req.user.id];
      }

      const result = await pool.query(query, params);

      if (!result.rows.length) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Log to MongoDB (optional)
      try {
        await Log.create({
          action: "CANCELLED",
          userId: req.user.id,
          role: req.user.role,
          details: { appointment: result.rows[0] },
        });
      } catch (logError) {
        console.warn("MongoDB logging failed:", logError.message);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling appointment:", err.message);
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  }
);

/**
 * GET /appointments/today
 * Get today's appointments
 * Accessible by clinic_staff and admin
 */
router.get(
  "/today",
  authMiddleware,
  roleMiddleware(["clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await pool.query(`
        SELECT 
          a.id,
          a.date,
          a.status,
          a.urgency,
          a.symptoms,
          p.name as patient_name,
          s.name as staff_name,
          c.name as clinic_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN clinic_staff s ON a.staff_id = s.id
        LEFT JOIN clinics c ON a.clinic_id = c.id
        WHERE DATE(a.date) = $1
        ORDER BY a.date ASC
      `, [today]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ error: "Failed to fetch today's appointments" });
    }
  }
);

/**
 * POST /appointments/recommend
 * Get AI-powered appointment recommendations
 * Accessible by all authenticated users
 */
router.post(
  "/recommend",
  authMiddleware,
  async (req, res) => {
    try {
      const { symptoms, patient_id, preferred_date, preferred_time } = req.body;
      
      // Get available staff for the preferred date/time
      const staffResult = await pool.query(`
        SELECT 
          s.id,
          s.name,
          s.specialization,
          c.name as clinic_name,
          c.location
        FROM clinic_staff s
        JOIN clinics c ON s.clinic_id = c.id
        WHERE s.is_available = true
        ORDER BY s.specialization
      `);

      // Get patient history for better recommendations
      let patientHistory = [];
      if (patient_id) {
        const historyResult = await pool.query(`
          SELECT 
            a.date,
            a.symptoms,
            a.urgency,
            s.name as staff_name,
            s.specialization
          FROM appointments a
          LEFT JOIN clinic_staff s ON a.staff_id = s.id
          WHERE a.patient_id = $1
          ORDER BY a.date DESC
          LIMIT 5
        `, [patient_id]);
        patientHistory = historyResult.rows;
      }

      // Simple recommendation logic (can be enhanced with ML)
      const recommendations = staffResult.rows.map(staff => ({
        staff_id: staff.id,
        staff_name: staff.name,
        specialization: staff.specialization,
        clinic_name: staff.clinic_name,
        location: staff.location,
        match_score: Math.random() * 100, // Placeholder for ML-based scoring
        reason: `Specialized in ${staff.specialization}`
      })).sort((a, b) => b.match_score - a.match_score);

      res.json({
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        patient_history: patientHistory,
        suggested_urgency: symptoms?.toLowerCase().includes('urgent') ? 'urgent' : 'routine'
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  }
);

/**
 * GET /api/appointments/:id
 * Get a specific appointment by ID
 * - Patients can only see their own appointments
 * - Staff/admin can see any appointment
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const appointmentId = req.params.id;
      console.log("Fetching appointment with ID:", appointmentId);
      
      let query = `
        SELECT 
          a.id,
          a.date,
          a.status,
          a.urgency,
          a.symptoms,
          a.no_show_risk,
          a.synced,
          a.last_updated,
          a.created_at,
          -- Patient information
          p.patient_id,
          p.date_of_birth,
          p.gender,
          p.address,
          p.blood_group,
          p.allergies,
          p.chronic_conditions,
          p.emergency_contact,
          -- Patient user information
          pu.name as patient_name,
          pu.email as patient_email,
          pu.phone as patient_phone,
          -- Staff information
          s.staff_id,
          s.position,
          s.specialization,
          s.license_number,
          s.experience_years,
          s.clinic_id as staff_clinic_id,
          -- Staff user information
          su.name as staff_name,
          su.email as staff_email,
          su.phone as staff_phone,
          -- Clinic information
          c.clinic_id,
          c.name as clinic_name,
          c.location as clinic_location,
          c.contact_number as clinic_contact,
          c.capacity as clinic_capacity
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN users pu ON p.patient_id = pu.id
        LEFT JOIN clinic_staff s ON a.staff_id = s.staff_id
        LEFT JOIN users su ON s.staff_id = su.id
        LEFT JOIN clinics c ON a.clinic_id = c.clinic_id
        WHERE a.id = $1
      `;
      
      let params = [appointmentId];

      // If user is a patient, ensure they can only see their own appointments
      if (req.user.role === "patient") {
        query += ` AND a.patient_id = $2`;
        params.push(req.user.id);
      }

      console.log("Executing query:", query, "with params:", params);
      const result = await pool.query(query, params);
      console.log("Query result:", result.rows);

      if (!result.rows.length) {
        console.log("No appointment found with ID:", appointmentId);
        return res.status(404).json({ error: "Appointment not found" });
      }

      const appointment = result.rows[0];
      console.log("Found appointment:", appointment);
      console.log("Symptoms field:", appointment.symptoms);

      // Log the access (optional)
      try {
        await Log.create({
          action: "VIEW_APPOINTMENT",
          userId: req.user.id,
          role: req.user.role,
          details: { appointment_id: appointmentId },
        });
      } catch (logError) {
        console.warn("MongoDB logging failed:", logError.message);
      }

      res.json(appointment);
    } catch (err) {
      console.error("Error fetching appointment:", err.message);
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  }
);

/**
 * GET /appointments
 * Get all appointments with optional filtering
 * Accessible by all authenticated users
 */
router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const { status, patient_id, staff_id, clinic_id, date_from, date_to } = req.query;
      
      let query = `
        SELECT 
          a.id,
          a.date,
          a.status,
          a.urgency,
          a.symptoms,
          a.no_show_risk,
          a.created_at,
          p.name as patient_name,
          p.phone as patient_phone,
          s.name as staff_name,
          s.specialization,
          c.name as clinic_name,
          c.location as clinic_location
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN clinic_staff s ON a.staff_id = s.id
        LEFT JOIN clinics c ON a.clinic_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
      }

      if (patient_id) {
        paramCount++;
        query += ` AND a.patient_id = $${paramCount}`;
        params.push(patient_id);
      }

      if (staff_id) {
        paramCount++;
        query += ` AND a.staff_id = $${paramCount}`;
        params.push(staff_id);
      }

      if (clinic_id) {
        paramCount++;
        query += ` AND a.clinic_id = $${paramCount}`;
        params.push(clinic_id);
      }

      if (date_from) {
        paramCount++;
        query += ` AND a.date >= $${paramCount}`;
        params.push(date_from);
      }

      if (date_to) {
        paramCount++;
        query += ` AND a.date <= $${paramCount}`;
        params.push(date_to);
      }

      query += ` ORDER BY a.date DESC`;

      const result = await pool.query(query, params);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

module.exports = router;
