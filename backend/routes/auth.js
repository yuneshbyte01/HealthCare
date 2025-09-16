const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/postgres");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user account in the `users` table only.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, preferred_language } = req.body;

    // Hash password before storing
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, phone, preferred_language) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, phone, preferred_language",
      [name, email, hashed, role || "patient", phone || null, preferred_language || "nepali"] // default role = patient, default language = nepali
    );

    res.json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({
      error: "Registration failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user and issue a JWT.
 * Also check if the user's role-specific profile exists.
 * Updates last_login timestamp.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!userRes.rows.length) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];

    // Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Update last_login timestamp
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [user.id]
    );

    // Also update last_login in role-specific table if it exists
    if (user.role === "admin") {
      await pool.query(
        "UPDATE admins SET last_login = NOW() WHERE admin_id = $1",
        [user.id]
      );
    }

    // Generate JWT with id + role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Check if role-specific profile exists
    let profileComplete = false;
    if (user.role === "patient") {
      const check = await pool.query("SELECT 1 FROM patients WHERE patient_id=$1", [user.id]);
      profileComplete = check.rows.length > 0;
    } else if (user.role === "clinic_staff") {
      const check = await pool.query("SELECT 1 FROM clinic_staff WHERE staff_id=$1", [user.id]);
      profileComplete = check.rows.length > 0;
    } else if (user.role === "admin") {
      const check = await pool.query("SELECT 1 FROM admins WHERE admin_id=$1", [user.id]);
      profileComplete = check.rows.length > 0;
    }

    // Send token + user info back to frontend
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        preferred_language: user.preferred_language,
        last_login: new Date().toISOString(), // Include current login time in response
      },
      profileComplete, // frontend will use this to decide if profile form should show
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (optional - mainly for logging purposes)
 */
router.post("/logout", async (req, res) => {
  try {
    // In a more sophisticated system, you might want to:
    // 1. Add the token to a blacklist
    // 2. Log the logout event
    // 3. Update user status
    
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({
      error: "Logout failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
router.get("/me", async (req, res) => {
  try {
    // This would require auth middleware
    // For now, just return a placeholder
    res.json({ message: "This endpoint requires authentication middleware" });
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({
      error: "Failed to get user information",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
