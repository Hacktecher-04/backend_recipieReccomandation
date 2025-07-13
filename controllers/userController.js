const authService = require("../services/auth.service");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/userModel");


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'Strict', 
  maxAge: 24 * 24 * 60 * 60 * 1000, 
  path: '/', 
};

exports.registerUser = async (req, res) => {
  try {
    const token = await authService.register(req.body); 

    res
      .cookie('token', token, cookieOptions)
      .status(201)
      .json({ message: 'User registered successfully' }); 
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const token = await authService.login(req.body); // get token string

    res
      .cookie('token', token, cookieOptions)
      .status(200)
      .json({ message: 'Login successful' });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


exports.uploadProfile = async (req, res) => {
  try {
    const { userName, imageUrl } = req.body;
    const userId = req.user._id;
    let fileName = "";

    if (req.file) {
      fileName = req.file.filename;
    }

    else if (imageUrl) {
      const extension = path.extname(new URL(imageUrl).pathname) || ".jpg";
      fileName = `${userId}${extension}`;
      const filePath = path.join(__dirname, "..", "uploads", fileName);

      const response = await axios.get(imageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } else {
      return res.status(400).json({ message: "No image provided." });
    }

    const updatedUser = await userService.updateProfile(userId, userName, fileName);

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        userName: updatedUser.userName,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ message: "User logged out" });
};

