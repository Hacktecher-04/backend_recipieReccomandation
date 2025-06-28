const express = require("express");
const router = express.Router();
const userController =   require("../controllers/userController");
const protect = require("../middleware/auth.middleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", protect, userController.getProfile);
router.post("/logout", protect, userController.logoutUser);

module.exports = router;
