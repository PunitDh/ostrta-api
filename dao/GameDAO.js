const Round = require("../domain/Round");
const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    try {
      return await Game.findById(gameId).populate("players");
    } catch {
      return null;
    }
  },

  createGame: async function (player, opponent, icon) {
    const existingGame = await Game.findOne({
      players: { $all: [player, opponent] },
    }).populate("players");

    if (existingGame) {
      return existingGame;
    }

    const games = await Game.countDocuments();
    const game = await Game.create({
      name: `Game ${games + 1}`,
      players: [player, opponent],
      rounds: [new Round()],
      icon,
    });

    const createdGame = await Game.findById(game._id).populate("players");

    return createdGame;
  },

  updateGame: async function (gameId, update) {
    const game = await Game.findByIdAndUpdate(gameId, update, {
      returnDocument: "after",
    }).populate("players");

    return game;
  },

  findByPlayerId: async function (playerId) {
    return await Game.find({ players: playerId }).populate("players");
  },

  getRecentGames: async function (limit) {
    return await Game.find()
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate("players");
  },
};

module.exports = GameDAO;
