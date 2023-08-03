const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    return await Game.findById(gameId).populate("players").exec();
  },
  renameGame: async function (gameId, name) {
    return await Game.findByIdAndUpdate(gameId, { name });
  },
  closeGame: async function (gameId) {
    return await Game.findByIdAndUpdate(gameId, { closed: true });
  },
};

module.exports = GameDAO;
