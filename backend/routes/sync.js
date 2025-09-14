const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const Log = require("../models/Log");

const router = express.Router();

/**
 * POST /appointments/sync
 * Bulk sync appointments (patient’s own, from token).
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { appointments } = req.body;

    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const patientId = parseInt(req.user.id); // patient from token
    if (isNaN(patientId)) {
      return res.status(401).json({ error: "Invalid patient ID from token" });
    }

    const syncedAppointments = [];

    for (let appt of appointments) {
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, date, status, synced, last_updated)
         VALUES ($1, $2, 'scheduled', true, NOW())
         RETURNING *`,
        [patientId, appt.date]
      );

      const appointmentData = result.rows[0];
      syncedAppointments.push(appointmentData);

      await Log.create({
        action: "SYNCED",
        userId: patientId,
        details: { appointment: appointmentData }
      });
    }

    res.json({ message: "Sync complete", syncedAppointments });
  } catch (err) {
    console.error("Sync error:", err.message);
    res.status(500).json({ error: "Sync failed" });
  }
});

module.exports = router;
