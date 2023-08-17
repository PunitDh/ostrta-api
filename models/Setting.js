const mongoose = require("mongoose");

const Setting = new mongoose.Schema(
  {
    siteSettings: {
      conversations: {
        type: Boolean,
        default: false,
      },
      videoConverter: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", Setting);
