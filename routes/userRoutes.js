const express = require("express");
const router = express.Router();
const userController =   require("../controllers/userController");
const multer = require('multer')
const protect = require("../middleware/auth.middleware");
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, upload.single("profilePicture"), userController.uploadProfile );
router.get("/logout", protect, userController.logoutUser);

module.exports = router;
