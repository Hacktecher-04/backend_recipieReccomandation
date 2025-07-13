const express = require("express");
const router = express.Router();
const userController =   require("../controllers/userController");
const upload = require('../middleware/upload.middleware')
const protect = require("../middleware/auth.middleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, upload.single("image"), userController.uploadProfile );
router.get("/logout", protect, userController.logoutUser);

module.exports = router;
