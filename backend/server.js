const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/postgres");
const connectMongo = require("./db/mongo");

// Routes
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const syncRoutes = require("./routes/sync");
const profileRoutes = require("./routes/profile");
const aiRoutes = require("./routes/ai");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectMongo();

// Initialize database connection
async function initializeDatabase() {
  try {
    // Verify Postgres connection
    const connectionTest = await pool.query("SELECT NOW()");
    console.log("Postgres connected at:", connectionTest.rows[0].now);
    
    console.log("Database connection established successfully!");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}

// Initialize database before starting server
initializeDatabase();

// API Routes
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/sync", syncRoutes);
app.use("/profile", profileRoutes);
app.use("/ai", aiRoutes);
app.use("/analytics", analyticsRoutes);

// Debug route to test all routes
app.get("/debug/routes", (req, res) => {
  res.json({
    message: "All routes are registered",
    routes: [
      "/auth",
      "/appointments", 
      "/sync",
      "/profile",
      "/ai",
      "/analytics"
    ],
    profileRoutes: [
      "GET /profile/test",
      "POST /profile/patient",
      "POST /profile/clinic-staff", 
      "POST /profile/admin",
      "GET /profile/patient/me",
      "GET /profile/clinic-staff/me",
      "GET /profile/admin/me",
      "PUT /profile/patient",
      "PUT /profile/clinic-staff",
      "PUT /profile/admin"
    ]
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("Healthcare Backend API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("- GET /debug/routes - List all available routes");
  console.log("- GET /profile/test - Test profile routes");
});
