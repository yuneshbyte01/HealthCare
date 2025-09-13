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
      
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, staff_id, clinic_id, date, urgency, no_show_risk, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
        [patient_id, staff_id, clinic_id, finalDate, urgency, noShowRisk]
      );
      
      console.log("Appointment created:", result.rows[0]);

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

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error booking appointment:", err.message);
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

      await Log.create({
        action: "FETCH_APPOINTMENTS",
        userId: req.user.id,
        role: req.user.role,
        details: { count: result.rows.length },
      });

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
      
      // Log the recommendation
      await Log.create({
        action: "AI_RECOMMENDATION",
        userId: userId,
        details: {
          recommendation: recommendation,
          symptoms: symptoms,
          patient_id: patient_id
        }
      });
      
      res.json(recommendation);
    } catch (err) {
      console.error("Error generating AI recommendation:", err.message);
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  }
);

/**
 * PUT /api/appointments/:id
 * - Patients can reschedule only their own appointments
 * - Staff/admin can reschedule any appointment
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["patient", "clinic_staff", "admin"]),
  async (req, res) => {
    try {
      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }

      let query = "UPDATE appointments SET date=$1 WHERE id=$2 RETURNING *";
      let params = [date, req.params.id];

      if (req.user.role === "patient") {
        query =
          "UPDATE appointments SET date=$1 WHERE id=$2 AND patient_id=$3 RETURNING *";
        params = [date, req.params.id, req.user.id];
      }

      const result = await pool.query(query, params);

      if (!result.rows.length) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      await Log.create({
        action: "RESCHEDULED",
        userId: req.user.id,
        role: req.user.role,
        details: { appointment: result.rows[0] },
      });

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error rescheduling appointment:", err.message);
      res.status(500).json({ error: "Failed to reschedule appointment" });
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

      await Log.create({
        action: "CANCELLED",
        userId: req.user.id,
        role: req.user.role,
        details: { appointment: result.rows[0] },
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling appointment:", err.message);
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  }
);

module.exports = router;
