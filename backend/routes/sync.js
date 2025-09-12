const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const Log = require("../models/Log");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { appointments } = req.body;
    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const syncedAppointments = [];

    for (let appt of appointments) {
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, date, synced, last_updated)
         VALUES ($1, $2, true, NOW())
         RETURNING *`,
        [appt.patient_id, appt.date]
      );

      const appointmentData = result.rows[0];
      syncedAppointments.push(appointmentData);

      // ✅ ensure MongoDB log is created
      await Log.create({
        action: "SYNCED",
        userId: Number(appt.patient_id),
        details: { appointment: appointmentData }
      });

      console.log("SYNC logged for patient:", appt.patient_id);
    }

    res.json({ message: "Sync complete", syncedAppointments });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

module.exports = router;
