const authService = require("../services/auth.service");
const profileUrl = require('../services/image.service')


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'None',    
  maxAge: 7 * 24 * 60 * 60 * 1000 
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
    const token = await authService.login(req.body);

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
    console.log(req.user.id)
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


exports.uploadProfile = async (req, res) => {
  try {
    const { userName } = req.body;
    const userId = req.user.id;
    const profilebuffer = req.file.buffer;

    const profilePicture = await profileUrl(userId, profilebuffer)

    const updatedUser = await authService.updateProfile(userId, userName, profilePicture.url);

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        userName: updatedUser.userName,
        profileImage: updatedUser.profilePicture,
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

