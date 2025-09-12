const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/postgres");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name, email, hashed, role || "patient"]
    );

    res.json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (!user.rows.length) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;
