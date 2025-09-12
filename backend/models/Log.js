const mongoose = require("mongoose");

/**
 * Log Schema
 * Stores user actions for auditing and tracking.
 */
const logSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true 
  }, // Action type (e.g., BOOKED, CANCELLED)

  userId: { 
    type: Number, 
    required: true 
  }, // ID of the user who performed the action

  details: { 
    type: Object 
  }, // Additional info (flexible JSON structure)

  timestamp: { 
    type: Date, 
    default: Date.now 
  } // Auto-set to current time
});

module.exports = mongoose.model("Log", logSchema);
