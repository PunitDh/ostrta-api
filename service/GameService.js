const {
  errorResponse,
  successResponse,
  notFoundResponse,
} = require("../domain/Response");
const { gameMapper } = require("../utils");
const { Rock, Paper, Scissors, Lizard, Spock } = require("../domain/Entity");
const Round = require("../domain/Round");
const GameDAO = require("../dao/GameDAO");
const PlayerDAO = require("../dao/PlayerDAO");

const GameService = {
  async createGame(gameInfo) {
    try {
      const game = await GameDAO.createGame(gameInfo);
      return successResponse(game);
    } catch (error) {
      return errorResponse(error.message);
    }
  },

  async rename(request) {
    try {
      const game = await GameDAO.renameGame(request.gameId, request.name);
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async resetRounds(request) {
    try {
      const game = await GameDAO.resetRounds(request.gameId);
      return successResponse(gameMapper(game));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async close(request) {
    try {
      const game = await GameDAO.closeGame(request.gameId);
      return successResponse(game);
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
      lastRound.winner = await calculateWinner(lastRound);
      game.rounds.push(new Round());
    }

    await game.save();
    return successResponse(gameMapper(game));
  },
};

async function calculateWinner(round) {
  const winners = {
    Rock: [Scissors, Lizard],
    Scissors: [Paper, Lizard],
    Paper: [Rock, Spock],
    Lizard: [Spock, Paper],
    Spock: [Scissors, Rock],
  };

  const methods = {
    Rock: [`crushes ${Scissors}`, `crushes ${Lizard}`],
    Scissors: [`cuts ${Paper}`, `decapitates ${Lizard}`],
    Paper: [`covers ${Rock}`, `disproves ${Spock}`],
    Lizard: [`poisons ${Spock}`, `eats ${Paper}`],
    Spock: [`smashes ${Scissors}`, `vaporizes ${Rock}`],
  };

  const findMethod = (move, opponentMove) =>
    methods[move].find((it) => it.includes(opponentMove));

  const getResult = async (playerId, move, opponentMove) => {
    const { firstName, lastName } = await PlayerDAO.getNames(playerId);
    const method = findMethod(move, opponentMove);
    const reason = `${move} ${method}`;
    return { playerId, firstName, lastName, method, reason };
  };

  if (round.moves[0].move === round.moves[1].move) {
    return {
      method: "Tie",
      reason: "Tie",
      playerId: null,
      firstName: null,
      lastName: null,
    };
  }

  if (winners[round.moves[0].move].includes(round.moves[1].move)) {
    return getResult(
      round.moves[0].player,
      round.moves[0].move,
      round.moves[1].move
    );
  }

  if (winners[round.moves[1].move].includes(round.moves[0].move)) {
    return getResult(
      round.moves[1].player,
      round.moves[1].move,
      round.moves[0].move
    );
  }
}

module.exports = GameService;
