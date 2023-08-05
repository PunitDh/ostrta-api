const mongoose = require("mongoose");

const Player = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Player", Player);
