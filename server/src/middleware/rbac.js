export const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: "Forbidden: Access denied" } });
    }

    next();
  };
};
