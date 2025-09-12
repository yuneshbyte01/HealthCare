const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role"); // RBAC middleware
const Log = require("../models/Log");

const router = express.Router();

/**
 * POST /api/appointments
 * Patients book their own appointments.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["patient"]), // only patients can book
  async (req, res) => {
    try {
      const { date } = req.body;
      const patient_id = req.user.id;

      const result = await pool.query(
        "INSERT INTO appointments (patient_id, date) VALUES ($1, $2) RETURNING *",
        [patient_id, date]
      );

      await Log.create({
        action: "BOOKED",
        userId: patient_id,
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
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (req.user.role === "patient") {
      result = await pool.query(
        "SELECT * FROM appointments WHERE patient_id=$1 ORDER BY date ASC",
        [req.user.id]
      );
    } else if (["clinic_staff", "admin"].includes(req.user.role)) {
      result = await pool.query("SELECT * FROM appointments ORDER BY date ASC");
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    await Log.create({
      action: "FETCH_APPOINTMENTS",
      userId: req.user.id,
      details: { count: result.rows.length },
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * DELETE /api/appointments/:id
 * - Patients can cancel only their own appointments
 * - Staff/admin can cancel any appointment
 */
router.delete("/:id", authMiddleware, async (req, res) => {
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
      details: { appointment: result.rows[0] },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error cancelling appointment:", err.message);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
