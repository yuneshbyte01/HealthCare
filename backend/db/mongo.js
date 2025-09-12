const mongoose = require("mongoose");

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = connectMongo;
