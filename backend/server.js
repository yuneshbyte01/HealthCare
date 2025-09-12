const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/postgres");
const connectMongo = require("./db/mongo");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const syncRoutes = require("./routes/sync");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectMongo();

// Verify Postgres connection
pool.query("SELECT NOW()")
  .then(res => console.log("Postgres connected at:", res.rows[0].now))
  .catch(err => console.error("Postgres connection error:", err));

// API Routes
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/sync", syncRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Healthcare Backend API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
