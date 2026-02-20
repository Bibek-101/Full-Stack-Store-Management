const jwt = require("jsonwebtoken");

/* ================= AUTHENTICATE ================= */
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔴 No header
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 🔴 Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    // 🔴 No token
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


/* ================= AUTHORIZE ================= */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // 🔴 No user
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 🔴 Role mismatch
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions"
        });
      }

      next();

    } catch (error) {
      console.error("AUTHORIZE ERROR:", error.message);
      return res.status(500).json({ message: "Server error" });
    }
  };
};