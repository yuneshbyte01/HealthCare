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
      // --- Call ML-based triage service ---
      const triageRes = await axios.post("http://localhost:6000/ml-triage", {
        age: 65, // Default age - can be enhanced to get from patient profile
        fever: (symptoms || "").toLowerCase().includes("fever"),
        chestpain: (symptoms || "").toLowerCase().includes("chest pain")
      });
      urgency = triageRes.data.urgency;
      console.log("ML Triage response:", triageRes.data);
    } catch (aiError) {
      console.warn("ML triage service unavailable:", aiError.message);
    }

    try {
      // --- Call AI no-show predictor ---
      const noshowRes = await axios.post("http://localhost:6000/noshow", { patient_id, date });
      noShowRisk = noshowRes.data.no_show_risk;
      console.log("AI No-show response:", noshowRes.data);
    } catch (aiError) {
      console.warn("AI no-show service unavailable:", aiError.message);
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
        // --- Call ML-based triage service ---
        const triageRes = await axios.post("http://localhost:6000/ml-triage", {
          age: 65, // Default age - can be enhanced to get from patient profile
          fever: (symptoms || "").toLowerCase().includes("fever"),
          chestpain: (symptoms || "").toLowerCase().includes("chest pain")
        });
        urgency = triageRes.data.urgency;
        console.log("ML Triage response:", triageRes.data);
      } catch (aiError) {
        console.warn("ML triage service unavailable, using default urgency:", aiError.message);
      }

      try {
        // --- Call AI no-show predictor ---
        const noshowRes = await axios.post("http://localhost:6000/noshow", { patient_id, date });
        noShowRisk = noshowRes.data.no_show_risk;
      } catch (aiError) {
        console.warn("AI no-show service unavailable, using default risk:", aiError.message);
      }

      console.log("Booking appointment for patient:", patient_id, "with AI data:", { urgency, noShowRisk });
      
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, staff_id, clinic_id, date, urgency, no_show_risk, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
        [patient_id, staff_id, clinic_id, date, urgency, noShowRisk]
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
