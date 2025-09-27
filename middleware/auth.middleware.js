const { verifyToken } = require('../utils/generateToken')

const authMiddleware = (req, res, next) => {
 const token = (req.headers.authorization || '')
  .replace(/^Bearer\s+/i, '')
  .replace(/^"|"$/g, '') // removes starting/ending quote if present
  .trim();

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

};

module.exports = authMiddleware;
