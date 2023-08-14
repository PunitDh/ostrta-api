const mongoose = require("mongoose");

const Conversation = new mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    messages: [
      {
        type: new mongoose.Schema(
          {
            sender: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Player",
            },
            message: { type: String },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", Conversation);
