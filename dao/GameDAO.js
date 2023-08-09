const Round = require("../domain/Round");
const Game = require("../models/Game");

const GameDAO = {
  findByIdAndPopulate: async function (gameId) {
    return await Game.findById(gameId).populate("players").exec();
  },
  createGame: async function () {
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
    return await Game.findByIdAndUpdate(
      gameId,
      { name },
      { returnDocument: "after" }
    );
  },
  closeGame: async function (gameId) {
    return await Game.findByIdAndUpdate(
      gameId,
      { closed: true },
      { returnDocument: "after" }
    );
  },
  findByPlayerId: async function (playerId) {
    return await Game.find({
      players: playerId,
      closed: false,
    });
  },
};

module.exports = GameDAO;
