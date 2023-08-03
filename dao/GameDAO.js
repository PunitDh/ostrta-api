const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    return await Game.findById(gameId).populate("players").exec();
  },
};

module.exports = GameDAO;
