const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const Log = require("../models/Log");

const router = express.Router();

/**
 * POST /api/appointments/sync
 * Sync multiple appointments in bulk (requires authentication).
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { appointments } = req.body;

    // Validate input
    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const syncedAppointments = [];

    for (let appt of appointments) {
      // Insert or update appointment in Postgres
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, date, synced, last_updated)
         VALUES ($1, $2, true, NOW())
         RETURNING *`,
        [appt.patient_id, appt.date]
      );

      const appointmentData = result.rows[0];
      syncedAppointments.push(appointmentData);

      // Log sync event in MongoDB
      await Log.create({
        action: "SYNCED",
        userId: Number(appt.patient_id),
        details: { appointment: appointmentData }
      });

      console.log("Sync logged for patient:", appt.patient_id);
    }

    res.json({ message: "Sync complete", syncedAppointments });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

module.exports = router;
