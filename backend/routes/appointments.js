const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth"); // protect routes later

const router = express.Router();

// Book appointment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;
    const patient_id = req.user.id; // comes from JWT

    const result = await pool.query(
      "INSERT INTO appointments (patient_id, date) VALUES ($1, $2) RETURNING *",
      [patient_id, date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// Get all appointments (clinic staff/admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Cancel appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM appointments WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
