const Round = require("../domain/Round");
const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    return await Game.findById(gameId).populate("players").exec();
  },
  createGame: async function (gameInfo) {
    const games = await Game.countDocuments();
    const game = await Game.create({
      name: `Game ${games + 1}`,
      players: gameInfo.players,
      rounds: [new Round()],
      icon: gameInfo.icon,
    });
    const createdGame = await Game.findById(game._id)
      .populate("players")
      .exec();

    return createdGame;
  },
  updateGame: async function (gameId, update) {
    const game = await Game.findByIdAndUpdate(gameId, update, {
      returnDocument: "after",
    })
      .populate("players")
      .exec();
    return game;
  },
  findByPlayerId: async function (playerId) {
    return await Game.find({ players: playerId }).populate("players").exec();
  },
  getRecentGames: async function () {
    return await Game.find().sort({ updatedAt: -1 }).populate("players").exec();
  },
};

module.exports = GameDAO;
