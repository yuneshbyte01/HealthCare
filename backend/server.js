const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/postgres");
const connectMongo = require("./db/mongo");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");

const app = express();
app.use(cors());
app.use(express.json());

// Connect Databases
connectMongo();

pool.query("SELECT NOW()")
  .then(res => console.log("Postgres connected at:", res.rows[0].now))
  .catch(err => console.error("Postgres connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Healthcare Backend API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
