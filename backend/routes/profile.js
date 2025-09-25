const express = require("express");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Debug endpoint to test if routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Profile routes are working", timestamp: new Date().toISOString() });
});

/**
 * POST /api/profile/patient
 * Create patient profile for the currently logged-in user.
 */
router.post("/patient", authMiddleware, async (req, res) => {
  try {
    const { date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact } = req.body;
    const userId = req.user.id;

    console.log("Creating patient profile for user:", userId);
    console.log("Profile data:", req.body);

    // Check if profile already exists
    const existingProfile = await pool.query(
      "SELECT patient_id FROM patients WHERE patient_id = $1",
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({ error: "Patient profile already exists" });
    }

    // Insert into patients table
    const result = await pool.query(
      `INSERT INTO patients 
       (patient_id, date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact]
    );

    console.log("Patient profile created successfully:", result.rows[0]);

    res.json({ 
      message: "Patient profile created successfully",
      profile: result.rows[0]
    });
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
    const { position, specialization, license_number, experience_years, clinic_id } = req.body;
    const userId = req.user.id;

    console.log("Creating clinic staff profile for user:", userId);

    // Check if profile already exists
    const existingProfile = await pool.query(
      "SELECT staff_id FROM clinic_staff WHERE staff_id = $1",
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({ error: "Clinic staff profile already exists" });
    }

    // Insert into clinic_staff table
    const result = await pool.query(
      `INSERT INTO clinic_staff 
       (staff_id, position, specialization, license_number, experience_years, clinic_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, position, specialization, license_number, experience_years, clinic_id]
    );

    res.json({ 
      message: "Clinic staff profile created successfully",
      profile: result.rows[0]
    });
  } catch (err) {
    console.error("Error creating clinic staff profile:", err.message);
    res.status(500).json({ error: "Failed to create clinic staff profile" });
  }
});

/**
 * POST /api/profile/admin
 * Create admin profile for the currently logged-in user.
 */
router.post("/admin", authMiddleware, async (req, res) => {
  try {
    const { department, access_level, last_login } = req.body;
    const userId = req.user.id;

    console.log("Creating admin profile for user:", userId);

    // Check if profile already exists
    const existingProfile = await pool.query(
      "SELECT admin_id FROM admins WHERE admin_id = $1",
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({ error: "Admin profile already exists" });
    }

    // Insert into admins table
    const result = await pool.query(
      `INSERT INTO admins 
       (admin_id, department, access_level, last_login) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, department, access_level, last_login]
    );

    res.json({ 
      message: "Admin profile created successfully",
      profile: result.rows[0]
    });
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
    console.log("Fetching patient profile for user:", userId);
    
    const result = await pool.query("SELECT * FROM patients WHERE patient_id = $1", [userId]);
    
    if (result.rows.length === 0) {
      console.log("No patient profile found for user:", userId);
      return res.status(404).json({ error: "Patient profile not found" });
    }
    
    console.log("Patient profile found:", result.rows[0]);
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
    console.log("Fetching clinic staff profile for user:", userId);
    
    const result = await pool.query("SELECT * FROM clinic_staff WHERE staff_id = $1", [userId]);
    
    if (result.rows.length === 0) {
      console.log("No clinic staff profile found for user:", userId);
      return res.status(404).json({ error: "Clinic staff profile not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching clinic staff profile:", err.message);
    res.status(500).json({ error: "Failed to fetch clinic staff profile" });
  }
});

/**
 * GET /api/profile/admin/me
 * Get the admin profile of the currently logged-in user.
 */
router.get("/admin/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching admin profile for user:", userId);
    
    const result = await pool.query("SELECT * FROM admins WHERE admin_id = $1", [userId]);
    
    if (result.rows.length === 0) {
      console.log("No admin profile found for user:", userId);
      return res.status(404).json({ error: "Admin profile not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching admin profile:", err.message);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
});

/**
 * GET /api/profile/clinic-staff/all
 * Get all clinic staff profiles (admin only).
 */
router.get("/clinic-staff/all", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    console.log("Fetching all clinic staff profiles");
    
    const result = await pool.query(`
      SELECT 
        cs.staff_id,
        u.name,
        u.email,
        u.phone,
        cs.position,
        cs.specialization,
        cs.license_number,
        cs.experience_years,
        cs.clinic_id,
        c.name as clinic_name
      FROM clinic_staff cs
      JOIN users u ON cs.staff_id = u.id
      LEFT JOIN clinics c ON cs.clinic_id = c.clinic_id
      ORDER BY cs.experience_years DESC, u.name ASC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all clinic staff profiles:", err.message);
    res.status(500).json({ error: "Failed to fetch clinic staff profiles" });
  }
});

/**
 * PUT /api/profile/patient
 * Update the patient profile of the currently logged-in user.
 */
router.put("/patient", authMiddleware, async (req, res) => {
  try {
    console.log("PUT /profile/patient route hit");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);

    const { date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact } = req.body;
    const userId = req.user.id;

    console.log("Updating patient profile for user:", userId);
    console.log("Update data:", req.body);

    // First check if profile exists
    const existingProfile = await pool.query(
      "SELECT patient_id FROM patients WHERE patient_id = $1",
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      console.log("No existing profile found, creating new one");
      // Create new profile if it doesn't exist
      const result = await pool.query(
        `INSERT INTO patients 
         (patient_id, date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact]
      );

      console.log("Patient profile created successfully:", result.rows[0]);

      return res.json({ 
        message: "Patient profile created successfully",
        profile: result.rows[0]
      });
    }

    // Update existing profile
    const result = await pool.query(
      `UPDATE patients 
       SET date_of_birth = $1, gender = $2, address = $3, blood_group = $4, allergies = $5, chronic_conditions = $6, emergency_contact = $7
       WHERE patient_id = $8
       RETURNING *`,
      [date_of_birth, gender, address, blood_group, allergies, chronic_conditions, emergency_contact, userId]
    );

    if (result.rows.length === 0) {
      console.log("No patient profile found to update for user:", userId);
      return res.status(404).json({ error: "Patient profile not found" });
    }

    console.log("Patient profile updated successfully:", result.rows[0]);

    res.json({ 
      message: "Patient profile updated successfully",
      profile: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating patient profile:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ error: "Failed to update patient profile" });
  }
});

/**
 * PUT /api/profile/clinic-staff
 * Update the clinic staff profile of the currently logged-in user.
 */
router.put("/clinic-staff", authMiddleware, async (req, res) => {
  try {
    console.log("PUT /profile/clinic-staff route hit");
    const { position, specialization, license_number, experience_years, clinic_id } = req.body;
    const userId = req.user.id;

    console.log("Updating clinic staff profile for user:", userId);

    // First check if profile exists
    const existingProfile = await pool.query(
      "SELECT staff_id FROM clinic_staff WHERE staff_id = $1",
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      console.log("No existing clinic staff profile found, creating new one");
      // Create new profile if it doesn't exist
      const result = await pool.query(
        `INSERT INTO clinic_staff 
         (staff_id, position, specialization, license_number, experience_years, clinic_id) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, position, specialization, license_number, experience_years, clinic_id]
      );

      return res.json({ 
        message: "Clinic staff profile created successfully",
        profile: result.rows[0]
      });
    }

    // Update existing profile
    const result = await pool.query(
      `UPDATE clinic_staff 
       SET position = $1, specialization = $2, license_number = $3, experience_years = $4, clinic_id = $5
       WHERE staff_id = $6
       RETURNING *`,
      [position, specialization, license_number, experience_years, clinic_id, userId]
    );

    if (result.rows.length === 0) {
      console.log("No clinic staff profile found to update for user:", userId);
      return res.status(404).json({ error: "Clinic staff profile not found" });
    }

    res.json({ 
      message: "Clinic staff profile updated successfully",
      profile: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating clinic staff profile:", err.message);
    res.status(500).json({ error: "Failed to update clinic staff profile" });
  }
});

/**
 * PUT /api/profile/admin
 * Update the admin profile of the currently logged-in user.
 */
router.put("/admin", authMiddleware, async (req, res) => {
  try {
    console.log("PUT /profile/admin route hit");
    const { department, access_level, last_login } = req.body;
    const userId = req.user.id;

    console.log("Updating admin profile for user:", userId);

    // First check if profile exists
    const existingProfile = await pool.query(
      "SELECT admin_id FROM admins WHERE admin_id = $1",
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      console.log("No existing admin profile found, creating new one");
      // Create new profile if it doesn't exist
      const result = await pool.query(
        `INSERT INTO admins 
         (admin_id, department, access_level, last_login) 
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, department, access_level, last_login || new Date()]
      );

      return res.json({ 
        message: "Admin profile created successfully",
        profile: result.rows[0]
      });
    }

    // Update existing profile
    const result = await pool.query(
      `UPDATE admins 
       SET department = $1, access_level = $2, last_login = $3
       WHERE admin_id = $4
       RETURNING *`,
      [department, access_level, last_login || new Date(), userId]
    );

    if (result.rows.length === 0) {
      console.log("No admin profile found to update for user:", userId);
      return res.status(404).json({ error: "Admin profile not found" });
    }

    res.json({ 
      message: "Admin profile updated successfully",
      profile: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating admin profile:", err.message);
    res.status(500).json({ error: "Failed to update admin profile" });
  }
});

module.exports = router;
