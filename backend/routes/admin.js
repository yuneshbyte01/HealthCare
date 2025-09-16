const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db/postgres");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");

const router = express.Router();

// ======================
// CLINIC MANAGEMENT
// ======================

/**
 * GET /api/admin/clinics
 * Get all clinics
 */
router.get("/clinics", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(cs.staff_id) as staff_count,
             COUNT(p.patient_id) as patient_count
      FROM clinics c
      LEFT JOIN clinic_staff cs ON c.clinic_id = cs.clinic_id
      LEFT JOIN patients p ON c.clinic_id = p.clinic_id
      GROUP BY c.clinic_id
      ORDER BY c.name
    `);
    
    res.json({
      success: true,
      clinics: result.rows
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clinics"
    });
  }
});

/**
 * POST /api/admin/clinics
 * Create a new clinic
 */
router.post("/clinics", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, address, phone, email, capacity, services } = req.body;
    
    const result = await pool.query(
      `INSERT INTO clinics (name, address, phone, email, capacity, services)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, address, phone, email, capacity, services]
    );
    
    res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      clinic: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create clinic"
    });
  }
});

/**
 * PUT /api/admin/clinics/:id
 * Update a clinic
 */
router.put("/clinics/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, capacity, services } = req.body;
    
    const result = await pool.query(
      `UPDATE clinics 
       SET name = $1, address = $2, phone = $3, email = $4, capacity = $5, services = $6
       WHERE clinic_id = $7
       RETURNING *`,
      [name, address, phone, email, capacity, services, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }
    
    res.json({
      success: true,
      message: "Clinic updated successfully",
      clinic: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update clinic"
    });
  }
});

/**
 * DELETE /api/admin/clinics/:id
 * Delete a clinic
 */
router.delete("/clinics/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if clinic has staff or patients
    const checkResult = await pool.query(
      `SELECT COUNT(*) as count FROM clinic_staff WHERE clinic_id = $1
       UNION ALL
       SELECT COUNT(*) as count FROM patients WHERE clinic_id = $1`,
      [id]
    );
    
    const staffCount = parseInt(checkResult.rows[0].count);
    const patientCount = parseInt(checkResult.rows[1].count);
    
    if (staffCount > 0 || patientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete clinic. It has ${staffCount} staff members and ${patientCount} patients.`
      });
    }
    
    const result = await pool.query(
      "DELETE FROM clinics WHERE clinic_id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }
    
    res.json({
      success: true,
      message: "Clinic deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete clinic"
    });
  }
});

// ======================
// PATIENT MANAGEMENT
// ======================

/**
 * GET /api/admin/patients
 * Get all patients with their clinic information
 */
router.get("/patients", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', clinic_id = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.created_at, u.last_login,
             p.patient_id, p.date_of_birth, p.gender, p.address, p.blood_group,
             p.allergies, p.chronic_conditions, p.emergency_contact,
             c.name as clinic_name, c.clinic_id
      FROM users u
      JOIN patients p ON u.id = p.user_id
      LEFT JOIN clinics c ON p.clinic_id = c.clinic_id
      WHERE u.role = 'patient'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (clinic_id) {
      paramCount++;
      query += ` AND p.clinic_id = $${paramCount}`;
      params.push(clinic_id);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN patients p ON u.id = p.user_id
      WHERE u.role = 'patient'
    `;
    
    const countParams = [];
    let countParamCount = 0;
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (u.name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (clinic_id) {
      countParamCount++;
      countQuery += ` AND p.clinic_id = $${countParamCount}`;
      countParams.push(clinic_id);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      patients: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients"
    });
  }
});

/**
 * POST /api/admin/patients
 * Create a new patient
 */
router.post("/patients", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { 
      name, email, password, phone, preferred_language,
      date_of_birth, gender, address, blood_group, allergies, 
      chronic_conditions, emergency_contact, clinic_id 
    } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password, role, phone, preferred_language)
         VALUES ($1, $2, $3, 'patient', $4, $5)
         RETURNING id`,
        [name, email, hashedPassword, phone, preferred_language]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create patient profile
      const patientResult = await pool.query(
        `INSERT INTO patients (user_id, date_of_birth, gender, address, blood_group, 
                              allergies, chronic_conditions, emergency_contact, clinic_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, date_of_birth, gender, address, blood_group, 
         allergies, chronic_conditions, emergency_contact, clinic_id]
      );
      
      await pool.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: "Patient created successfully",
        patient: {
          user_id: userId,
          ...patientResult.rows[0]
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create patient"
    });
  }
});

/**
 * PUT /api/admin/patients/:id
 * Update a patient
 */
router.put("/patients/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, preferred_language,
      date_of_birth, gender, address, blood_group, allergies, 
      chronic_conditions, emergency_contact, clinic_id 
    } = req.body;
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Update user
      await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, phone = $3, preferred_language = $4
         WHERE id = $5`,
        [name, email, phone, preferred_language, id]
      );
      
      // Update patient profile
      const result = await pool.query(
        `UPDATE patients 
         SET date_of_birth = $1, gender = $2, address = $3, blood_group = $4,
             allergies = $5, chronic_conditions = $6, emergency_contact = $7, clinic_id = $8
         WHERE user_id = $9
         RETURNING *`,
        [date_of_birth, gender, address, blood_group, 
         allergies, chronic_conditions, emergency_contact, clinic_id, id]
      );
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Patient not found"
        });
      }
      
      await pool.query('COMMIT');
      
      res.json({
        success: true,
        message: "Patient updated successfully",
        patient: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient"
    });
  }
});

/**
 * DELETE /api/admin/patients/:id
 * Delete a patient
 */
router.delete("/patients/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if patient has appointments
    const appointmentCheck = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE patient_id = $1",
      [id]
    );
    
    const appointmentCount = parseInt(appointmentCheck.rows[0].count);
    if (appointmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete patient. They have ${appointmentCount} appointments.`
      });
    }
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Delete patient profile
      await pool.query("DELETE FROM patients WHERE user_id = $1", [id]);
      
      // Delete user
      const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Patient not found"
        });
      }
      
      await pool.query('COMMIT');
      
      res.json({
        success: true,
        message: "Patient deleted successfully"
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete patient"
    });
  }
});

// ======================
// CLINIC STAFF MANAGEMENT
// ======================

/**
 * GET /api/admin/staff
 * Get all clinic staff with their clinic information
 */
router.get("/staff", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', clinic_id = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.created_at, u.last_login,
             cs.staff_id, cs.specialization, cs.license_number, cs.experience_years,
             cs.working_hours, cs.availability_status,
             c.name as clinic_name, c.clinic_id
      FROM users u
      JOIN clinic_staff cs ON u.id = cs.user_id
      LEFT JOIN clinics c ON cs.clinic_id = c.clinic_id
      WHERE u.role = 'clinic_staff'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (clinic_id) {
      paramCount++;
      query += ` AND cs.clinic_id = $${paramCount}`;
      params.push(clinic_id);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN clinic_staff cs ON u.id = cs.user_id
      WHERE u.role = 'clinic_staff'
    `;
    
    const countParams = [];
    let countParamCount = 0;
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (u.name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (clinic_id) {
      countParamCount++;
      countQuery += ` AND cs.clinic_id = $${countParamCount}`;
      countParams.push(clinic_id);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      staff: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff"
    });
  }
});

/**
 * POST /api/admin/staff
 * Create a new clinic staff member
 */
router.post("/staff", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { 
      name, email, password, phone, preferred_language,
      specialization, license_number, experience_years, 
      working_hours, availability_status, clinic_id 
    } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password, role, phone, preferred_language)
         VALUES ($1, $2, $3, 'clinic_staff', $4, $5)
         RETURNING id`,
        [name, email, hashedPassword, phone, preferred_language]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create clinic staff profile
      const staffResult = await pool.query(
        `INSERT INTO clinic_staff (user_id, specialization, license_number, experience_years, 
                                  working_hours, availability_status, clinic_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, specialization, license_number, experience_years, 
         working_hours, availability_status, clinic_id]
      );
      
      await pool.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: "Clinic staff created successfully",
        staff: {
          user_id: userId,
          ...staffResult.rows[0]
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create staff"
    });
  }
});

/**
 * PUT /api/admin/staff/:id
 * Update a clinic staff member
 */
router.put("/staff/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, preferred_language,
      specialization, license_number, experience_years, 
      working_hours, availability_status, clinic_id 
    } = req.body;
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Update user
      await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, phone = $3, preferred_language = $4
         WHERE id = $5`,
        [name, email, phone, preferred_language, id]
      );
      
      // Update clinic staff profile
      const result = await pool.query(
        `UPDATE clinic_staff 
         SET specialization = $1, license_number = $2, experience_years = $3,
             working_hours = $4, availability_status = $5, clinic_id = $6
         WHERE user_id = $7
         RETURNING *`,
        [specialization, license_number, experience_years, 
         working_hours, availability_status, clinic_id, id]
      );
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Staff member not found"
        });
      }
      
      await pool.query('COMMIT');
      
      res.json({
        success: true,
        message: "Staff member updated successfully",
        staff: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update staff"
    });
  }
});

/**
 * DELETE /api/admin/staff/:id
 * Delete a clinic staff member
 */
router.delete("/staff/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if staff has appointments
    const appointmentCheck = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE staff_id = $1",
      [id]
    );
    
    const appointmentCount = parseInt(appointmentCheck.rows[0].count);
    if (appointmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete staff member. They have ${appointmentCount} appointments.`
      });
    }
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Delete clinic staff profile
      await pool.query("DELETE FROM clinic_staff WHERE user_id = $1", [id]);
      
      // Delete user
      const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Staff member not found"
        });
      }
      
      await pool.query('COMMIT');
      
      res.json({
        success: true,
        message: "Staff member deleted successfully"
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete staff"
    });
  }
});

// ======================
// CLINIC ALLOCATION
// ======================

/**
 * PUT /api/admin/allocate-clinic
 * Allocate patients or staff to clinics
 */
router.put("/allocate-clinic", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { type, user_id, clinic_id } = req.body; // type: 'patient' or 'staff'
    
    if (!['patient', 'staff'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'patient' or 'staff'"
      });
    }
    
    let tableName = type === 'patient' ? 'patients' : 'clinic_staff';
    let idField = type === 'patient' ? 'patient_id' : 'staff_id';
    
    const result = await pool.query(
      `UPDATE ${tableName} 
       SET clinic_id = $1 
       WHERE user_id = $2 
       RETURNING *`,
      [clinic_id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }
    
    res.json({
      success: true,
      message: `${type} allocated to clinic successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error allocating clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to allocate clinic"
    });
  }
});

module.exports = router;