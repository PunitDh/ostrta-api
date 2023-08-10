const Round = require("../domain/Round");
const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    return await Game.findById(gameId).populate("players").exec();
  },
  createGame: async function (gameInfo) {
    const games = await Game.find();
    const game = await Game.create({
      name: `Game ${games.length + 1}`,
      players: gameInfo.players,
      rounds: [new Round()],
    });
    const createdGame = {
      name: game.name,
      id: game.id,
    };
    return createdGame;
  },
  resetRounds: async function (gameId) {
    const game = await Game.findByIdAndUpdate(
      gameId,
      { rounds: [new Round()] },
      { returnDocument: "after" }
    )
      .populate("players")
      .exec();
    return game;
  },
  renameGame: async function (gameId, name) {
    const game = await Game.findByIdAndUpdate(
      gameId,
      { name },
      { returnDocument: "after" }
    )
      .populate("players")
      .exec();
    return game;
  },
  closeGame: async function (gameId) {
    return await Game.findByIdAndUpdate(
      gameId,
      { closed: true },
      { returnDocument: "after" }
    )
      .populate("players")
      .exec();
  },
  findByPlayerId: async function (playerId) {
    return await Game.find({
      players: playerId,
      closed: false,
    });
  },
  getRecentGames: async function () {
    return await Game.find({ closed: false })
      .sort({ updatedAt: -1 })
      .populate("players")
      .exec();
  },
};

module.exports = GameDAO;
