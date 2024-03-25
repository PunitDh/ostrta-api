import mongoose from "mongoose";

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
    icon: {
      type: Number,
      default: 1,
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
                },
                move: { type: String },
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

export default mongoose.model("Game", Game);
