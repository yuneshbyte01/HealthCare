const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth"); // estructured import
const roleMiddleware = require("../middleware/role");     // role-based access
const Log = require("../models/Log");

const router = express.Router();

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
      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }

      const patient_id = req.user.id;

      const result = await pool.query(
        "INSERT INTO appointments (patient_id, date) VALUES ($1, $2) RETURNING *",
        [patient_id, date]
      );

      await Log.create({
        action: "BOOKED",
        userId: patient_id,
        role: req.user.role,
        details: { appointment: result.rows[0] },
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
        result = await pool.query(
          "SELECT * FROM appointments WHERE patient_id=$1 ORDER BY date ASC",
          [req.user.id]
        );
      } else {
        result = await pool.query("SELECT * FROM appointments ORDER BY date ASC");
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
