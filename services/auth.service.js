const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

exports.register = async ({ userName, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("Email already registered");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
  });

  return {
    token: generateToken(user._id),
    user: { id: user._id, userName: user.userName, email: user.email, profilePicture: user.profilePicture }
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  return {
    token: generateToken(user._id),
    user: { id: user._id, userName: user.userName, email: user.email, profilePicture: user.profilePicture }
  };
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};
