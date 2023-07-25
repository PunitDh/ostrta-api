const mongoose = require("mongoose");

const Game = new mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
        validate: [arrayLimit, "{PATH} must have only 2 players"],
      },
    ],
    // players: [
    //   {
    //     type: String,
    //     required: true,
    //     // validate: [arrayLimit, "{PATH} must have only 2 players"],
    //   },
    // ],
    moves: [{ type: String }],
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 2;
}

module.exports = mongoose.model("Game", Game);
