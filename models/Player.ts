import mongoose from "mongoose";

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
    default: true,
  },
  avatar: {
    type: Number,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Player", Player);
