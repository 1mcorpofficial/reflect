const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "test_secret");
    req.user = payload; // { id, role, email }
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
