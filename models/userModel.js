const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "https://example.com/default-profile-picture.png",
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
