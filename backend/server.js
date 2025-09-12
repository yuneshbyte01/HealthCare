import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./db/postgres.js";
import connectMongo from "./db/mongo.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectMongo();

// Connect PostgreSQL
pool.connect()
  .then(() => console.log("✅ Postgres connected"))
  .catch(err => console.error("❌ Postgres connection error:", err.message));

// Test route
app.get("/", (req, res) => {
  res.send("Healthcare Backend API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
