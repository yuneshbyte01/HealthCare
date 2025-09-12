const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const Log = require("../models/Log"); // MongoDB log model

const router = express.Router();

/**
 * POST /api/appointments
 * Book a new appointment (requires authentication).
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;
    const patient_id = req.user.id; // Extracted from JWT

    const result = await pool.query(
      "INSERT INTO appointments (patient_id, date) VALUES ($1, $2) RETURNING *",
      [patient_id, date]
    );

    // Log booking in MongoDB
    await Log.create({
      action: "BOOKED",
      userId: patient_id,
      details: { appointment: result.rows[0] }
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

/**
 * GET /api/appointments
 * Retrieve all appointments (requires authentication).
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments ORDER BY date ASC"
    );

    // Log fetch action (optional, for auditing)
    await Log.create({
      action: "FETCH_APPOINTMENTS",
      userId: req.user.id,
      details: { count: result.rows.length }
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment by ID (requires authentication).
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Log cancellation in MongoDB
    await Log.create({
      action: "CANCELLED",
      userId: req.user.id,
      details: { appointment: result.rows[0] }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
