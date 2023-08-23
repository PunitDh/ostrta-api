const {
  errorResponse,
  successResponse,
  notFoundResponse,
} = require("../domain/Response");
const { Rock, Paper, Scissors, Lizard, Spock } = require("../domain/Entity");
const Round = require("../domain/Round");
const GameDAO = require("../dao/GameDAO");
const PlayerDAO = require("../dao/PlayerDAO");
const Winner = require("../domain/Winner");
const Game = require("../models/Game");
const { gameMapper } = require("../utils/mapper");
const { decodeJWT } = require("../utils/security");

const GameService = {
  async createGame(request) {
    try {
      const { id } = decodeJWT(request._jwt);
      const game = await GameDAO.createGame(id, request.opponent, request.icon);
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error.message);
    }
  },

  async updateGame(gameId, update) {
    try {
      const game = await GameDAO.updateGame(gameId, update);
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async renameGame(request) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        name: request.name,
      });
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async changeIcon(request) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        icon: request.icon,
      });
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async resetRounds(request) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        rounds: [new Round()],
      });
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getRecentGames(limit) {
    try {
      const games = await GameDAO.getRecentGames(limit);
      return successResponse(games.map(gameMapper));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async deleteGame(request) {
    try {
      const game = await Game.findByIdAndDelete(request.gameId);
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async loadGame(request) {
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    return game
      ? successResponse(gameMapper(game))
      : notFoundResponse(`No game found with gameId: ${request.gameId}`);
  },

  async playMove(request) {
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    const move = {
      player: request.playerId,
      move: request.move,
    };

    let lastRound = game.rounds[game.rounds.length - 1];

    if (lastRound.moves.length < 2) {
      lastRound.moves.push(move);
    }

    if (lastRound.moves.length === 2) {
      lastRound.winner = await calculateRoundWinner(lastRound);
      game.rounds.push(new Round());
    }

    await game.save();
    return successResponse(gameMapper(game));
  },
};

async function calculateRoundWinner(round) {
  const winningMoves = {
    Rock: [Scissors, Lizard],
    Scissors: [Paper, Lizard],
    Paper: [Rock, Spock],
    Lizard: [Spock, Paper],
    Spock: [Scissors, Rock],
  };

  const moveMethods = {
    Rock: [`crushes ${Scissors}`, `crushes ${Lizard}`],
    Scissors: [`cuts ${Paper}`, `decapitates ${Lizard}`],
    Paper: [`covers ${Rock}`, `disproves ${Spock}`],
    Lizard: [`poisons ${Spock}`, `eats ${Paper}`],
    Spock: [`smashes ${Scissors}`, `vaporizes ${Rock}`],
  };

  const findMethod = (move, opponentMove) =>
    moveMethods[move].find((method) => method.includes(opponentMove));

  const generateWinner = async (winnerId, loserId, move, opponentMove) => {
    const winner = await PlayerDAO.addWin(winnerId);
    await PlayerDAO.addLoss(loserId);
    const { firstName, lastName } = winner;
    const method = findMethod(move, opponentMove);
    const reason = `${move} ${method}`;
    return new Winner({
      playerId: winnerId,
      firstName,
      lastName,
      method,
      reason,
    });
  };

  if (round.moves[0].move === round.moves[1].move) {
    return new Winner({ method: "Tie", reason: "Tie" });
  }

  if (winningMoves[round.moves[0].move].includes(round.moves[1].move)) {
    return generateWinner(
      round.moves[0].player,
      round.moves[1].player,
      round.moves[0].move,
      round.moves[1].move
    );
  }

  if (winningMoves[round.moves[1].move].includes(round.moves[0].move)) {
    return generateWinner(
      round.moves[1].player,
      round.moves[0].player,
      round.moves[1].move,
      round.moves[0].move
    );
  }
}

module.exports = GameService;
