import mongoose from "mongoose";

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
            content: { type: String },
            read: {
              type: Boolean,
              default: false,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", Conversation);
