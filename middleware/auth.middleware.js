const { verifyToken } = require('../utils/generateToken')

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

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
