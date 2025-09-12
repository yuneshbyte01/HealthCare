const jwt = require("jsonwebtoken");

/**
 * Authentication middleware
 * Verifies JWT from the Authorization header (Bearer token).
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(403).json({ error: "No token provided" });

  // Expect header format: "Bearer <token>"
  const token = header.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Malformed token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
