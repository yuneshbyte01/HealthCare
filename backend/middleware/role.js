/**
 * Role-based Authorization Middleware
 * Allows access only if the authenticated user's role is in the allowed list.
 *
 * @param {string[]} roles - Array of allowed roles
 */
const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: no user context" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
};

module.exports = roleMiddleware;
