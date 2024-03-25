import Round from "../domain/Round";
import Game from "../models/Game";

const GameDAO = {
  findByIdAndPopulate: async function (gameId: string) {
    try {
      return await Game.findById(gameId).populate("players");
    } catch {
      return null;
    }
  },

  createGame: async function (player: string, opponent: string, icon: number) {
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

    const createdGame = await GameDAO.findByIdAndPopulate(game._id.toString());
    return createdGame;
  },

  updateGame: async function (gameId: string, update: any) {
    const game = await Game.findByIdAndUpdate(gameId, update, {
      returnDocument: "after",
    }).populate("players");

    return game;
  },

  findByPlayerId: async function (playerId: string) {
    return await Game.find({ players: playerId }).populate("players");
  },

  getRecentGames: async function (limit: number) {
    return await Game.find()
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate("players");
  },
};

export default GameDAO;
