const mongoose = require("mongoose");

const Game = new mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    name: {
      type: String,
      required: true,
    },
    closed: {
      type: Boolean,
      default: false,
    },
    rounds: [
      {
        moves: [
          {
            type: new mongoose.Schema(
              {
                player: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Player",
                  required: true,
                },
                move: { type: String, required: true },
              },
              { timestamps: true }
            ),
          },
        ],
        winner: {
          playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player",
            default: null,
          },
          firstName: {
            type: String,
            default: null,
          },
          lastName: {
            type: String,
            default: null,
          },
          method: {
            type: String,
            default: null,
          },
          reason: {
            type: String,
            default: null,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", Game);
