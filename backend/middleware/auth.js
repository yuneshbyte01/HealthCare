const jwt = require("jsonwebtoken");

/**
 * Authentication middleware
 * Verifies JWT from the Authorization header (Bearer token).
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  if (!header) return res.status(403).json({ error: "No token provided" });

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(403).json({ error: "Malformed token" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
