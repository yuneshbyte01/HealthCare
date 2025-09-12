/**
 * Role-based Authorization Middleware
 * Allows access only if the authenticated user's role is in the allowed list.
 *
 * @param {string[]} roles - Array of allowed roles
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Ensure user exists and has a permitted role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};

module.exports = roleMiddleware;
