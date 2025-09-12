const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const Log = require("../models/Log"); // MongoDB log model

const router = express.Router();

/**
 * 📌 Book appointment
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;
    const patient_id = req.user.id; // from JWT

    const result = await pool.query(
      "INSERT INTO appointments (patient_id, date) VALUES ($1, $2) RETURNING *",
      [patient_id, date]
    );

    // log booking in MongoDB
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
 * 📌 Get all appointments
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY date ASC");

    // optional logging for audit
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
 * 📌 Cancel appointment
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

    // log cancellation in MongoDB
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
