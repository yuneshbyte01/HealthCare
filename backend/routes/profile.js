const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/profile/patient
 * Create patient profile for the currently logged-in user.
 */
router.post("/patient", authMiddleware, async (req, res) => {
  try {
    const { phone_number, address, dob, gender, medical_history, preferred_language } = req.body;
    const userId = req.user.id;

    // Insert into patients table
    await pool.query(
      `INSERT INTO patients 
   (user_id, phone_number, address, dob, gender, medical_history, preferred_language) 
   VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, phone_number, address, dob, gender, medical_history, preferred_language || "en"]
    );

    res.json({ message: "Patient profile created successfully" });
  } catch (err) {
    console.error("Error creating patient profile:", err.message);
    res.status(500).json({ error: "Failed to create patient profile" });
  }
});

/**
 * POST /api/profile/clinic-staff
 * Create clinic staff profile for the currently logged-in user.
 */
router.post("/clinic-staff", authMiddleware, async (req, res) => {
  try {
    const { position, department, phone_number, work_schedule, permissions } = req.body;
    const userId = req.user.id;

    // Insert into clinic_staff table
    await pool.query(
      `INSERT INTO clinic_staff 
       (user_id, position, department, phone_number, work_schedule, permissions) 
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        userId,
        position,
        department,
        phone_number,
        work_schedule,
        permissions || "basic"
      ]
    );

    res.json({ message: "Clinic staff profile created successfully" });
  } catch (err) {
    console.error("Error creating clinic staff profile:", err.message);
    res.status(500).json({ error: "Failed to create clinic staff profile" });
  }
});

/**
 * POST /api/profile/admin
 * Create admin profile for the logged-in user.
 */
router.post("/admin", authMiddleware, async (req, res) => {
  try {
    const { permissions, super_admin } = req.body;
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO admins (user_id, permissions, super_admin)
       VALUES ($1, $2, $3)`,
      [
        userId,
        permissions || "full",
        super_admin || false
      ]
    );

    res.json({ message: "Admin profile created successfully" });
  } catch (err) {
    console.error("Error creating admin profile:", err.message);
    res.status(500).json({ error: "Failed to create admin profile" });
  }
});

/**
 * GET /api/profile/patient/me
 * Get the patient profile of the currently logged-in user.
 */
router.get("/patient/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM patients WHERE user_id = $1", [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching patient profile:", err.message);
    res.status(500).json({ error: "Failed to fetch patient profile" });
  }
});

/**
 * GET /api/profile/clinic-staff/me
 * Get the clinic staff profile of the currently logged-in user.
 */
router.get("/clinic-staff/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM clinic_staff WHERE user_id = $1", [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching clinic staff profile:", err.message);
    res.status(500).json({ error: "Failed to fetch clinic staff profile" });
  }
});

/**
 * GET /api/profile/admin/me
 * Fetch the admin's profile (if it exists).
 */
router.get("/admin/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins WHERE user_id=$1",[req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Error fetching admin profile:", err.message);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
});

module.exports = router;
