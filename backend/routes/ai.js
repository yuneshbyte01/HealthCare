const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const Log = require("../models/Log");

const router = express.Router();

/**
 * POST /api/ai/retrain
 * Admin endpoint to trigger model retraining
 * Requires admin role
 */
router.post(
  "/retrain",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      console.log("🔄 Admin triggered model retraining...");
      
      // Log the retraining request
      await Log.create({
        action: "AI_RETRAIN_REQUESTED",
        userId: userId,
        details: {
          requested_by: userId,
          timestamp: new Date().toISOString(),
          status: "initiated"
        }
      });
      
      // Path to the retraining script
      const scriptPath = path.join(__dirname, "../../ai-service/retrain_models.py");
      
      // Spawn the Python retraining process
      const pythonProcess = spawn("python", [scriptPath], {
        cwd: path.join(__dirname, "../../ai-service"),
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      let output = "";
      let errorOutput = "";
      
      // Capture stdout
      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
        console.log(`Retraining output: ${data}`);
      });
      
      // Capture stderr
      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error(`Retraining error: ${data}`);
      });
      
      // Handle process completion
      pythonProcess.on("close", async (code) => {
        const success = code === 0;
        
        // Log the retraining result
        await Log.create({
          action: "AI_RETRAIN_COMPLETED",
          userId: userId,
          details: {
            requested_by: userId,
            timestamp: new Date().toISOString(),
            status: success ? "success" : "failed",
            exit_code: code,
            output: output,
            error: errorOutput
          }
        });
        
        if (success) {
          console.log("✅ Model retraining completed successfully");
          res.json({
            success: true,
            message: "Models retrained successfully",
            output: output,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error("❌ Model retraining failed");
          res.status(500).json({
            success: false,
            message: "Model retraining failed",
            error: errorOutput,
            output: output,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Handle process errors
      pythonProcess.on("error", async (error) => {
        console.error("❌ Failed to start retraining process:", error);
        
        await Log.create({
          action: "AI_RETRAIN_ERROR",
          userId: userId,
          details: {
            requested_by: userId,
            timestamp: new Date().toISOString(),
            status: "error",
            error: error.message
          }
        });
        
        res.status(500).json({
          success: false,
          message: "Failed to start retraining process",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (err) {
      console.error("Error in retrain endpoint:", err.message);
      res.status(500).json({
        success: false,
        message: "Internal server error during retraining",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/ai/status
 * Get AI service status and model information
 */
router.get(
  "/status",
  authMiddleware,
  roleMiddleware(["admin", "clinic_staff"]),
  async (req, res) => {
    try {
      // Get recent retraining logs
      const recentRetrains = await Log.find({
        action: { $in: ["AI_RETRAIN_REQUESTED", "AI_RETRAIN_COMPLETED", "AI_RETRAIN_ERROR"] }
      })
      .sort({ timestamp: -1 })
      .limit(10);
      
      // Get AI usage statistics
      const aiUsage = await Log.find({
        action: { $in: ["BOOKED", "AI_RECOMMENDATION"] }
      })
      .sort({ timestamp: -1 })
      .limit(100);
      
      const stats = {
        total_ai_requests: aiUsage.length,
        recent_retrains: recentRetrains.length,
        last_retrain: recentRetrains.length > 0 ? recentRetrains[0].timestamp : null,
        models_status: {
          triage_model: "active",
          noshow_model: "active"
        }
      };
      
      res.json({
        success: true,
        status: "operational",
        statistics: stats,
        recent_activity: recentRetrains,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error("Error getting AI status:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to get AI status",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

module.exports = router;
