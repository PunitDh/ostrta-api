const mongoose = require("mongoose");

const RecipePreference = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    dietary: [
      {
        type: String,
      },
    ],
    intolerances: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: String,
      },
    ],
    dislikes: [
      {
        type: String,
      },
    ],
    favourites: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecipePreference", RecipePreference);
