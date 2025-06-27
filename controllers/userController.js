const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields (userName, email, password) are required.",
    });
  }

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName, // Correct syntax
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(404).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    
    

    const token = await jwt.sign(
      {
        id: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
      },
      process.env.SECRETE_KEY,
      { expiresIn: "24hr" }
    );

   res.cookie("token", token).json({
     success: true,
     message: "Login successfully!",
     token,
     user: {
       id: user._id,
       name: user.userName,
       email: user.email,
      
     },
   });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const logOut = async (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "logout Successfully!",
  });
};

module.exports = { registerUser, loginUser, logOut };
