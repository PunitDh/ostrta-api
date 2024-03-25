import {
  errorResponse,
  successResponse,
  notFoundResponse,
  createdResponse,
} from "../domain/APIResponse";
import Entity from "../domain/Entity";
import Round from "../domain/Round";
import GameDAO from "../dao/GameDAO";
import PlayerDAO from "../dao/PlayerDAO";
import Winner from "../domain/Winner";
import Game from "../models/Game";
import { gameMapper } from "../utils/mapper";
import { decodeJWT } from "../utils/security";

const GameService = {
  async createGame(request: { _jwt: string; opponent: any; icon: any }) {
    try {
      const { id } = decodeJWT(request._jwt);
      const game = await GameDAO.createGame(id, request.opponent, request.icon);
      return createdResponse(gameMapper(game));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async updateGame(gameId: any, update: any) {
    try {
      const game = await GameDAO.updateGame(gameId, update);
      return successResponse(gameMapper(game));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async renameGame(request: { gameId: any; name: any }) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        name: request.name,
      });
      return successResponse(gameMapper(game));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async changeIcon(request: { gameId: any; icon: any }) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        icon: request.icon,
      });
      return successResponse(gameMapper(game));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async resetRounds(request: { gameId: any }) {
    try {
      const game = await GameDAO.updateGame(request.gameId, {
        rounds: [new Round()],
      });
      return successResponse(gameMapper(game));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async getRecentGames(limit: any) {
    try {
      const games = await GameDAO.getRecentGames(limit);

      // console.log({ filteredGames });
      return successResponse(games.map(gameMapper));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async deleteGame(request: { gameId: string }) {
    try {
      const game = await Game.findByIdAndDelete(request.gameId);
      return successResponse(gameMapper(game as any));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async loadGame(request: { gameId: any }) {
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    return game
      ? successResponse(gameMapper(game))
      : notFoundResponse(`No game found with gameId: ${request.gameId}`);
  },

  async playMove(request: { gameId: string; playerId: string; move: any }) {
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    const move = {
      player: request.playerId,
      move: request.move,
    };

    let lastRound = game!.rounds[game!.rounds.length - 1];

    if (lastRound.moves.length < 2) {
      lastRound.moves.push(move as any);
    }

    if (lastRound.moves.length === 2) {
      lastRound.winner = (await calculateRoundWinner(lastRound as any)) as any;
      game!.rounds.push(new Round());
    }

    await game!.save();
    return successResponse(gameMapper(game));
  },
};

async function calculateRoundWinner(round: {
  moves: { move: any }[];
}): Promise<Winner | undefined> {
  const winningMoves = {
    [Entity.Rock]: [Entity.Scissors, Entity.Lizard],
    [Entity.Scissors]: [Entity.Paper, Entity.Lizard],
    [Entity.Paper]: [Entity.Rock, Entity.Spock],
    [Entity.Lizard]: [Entity.Spock, Entity.Paper],
    [Entity.Spock]: [Entity.Scissors, Entity.Rock],
  };

  const moveMethods = {
    [Entity.Rock]: [`crushes ${Entity.Scissors}`, `crushes ${Entity.Lizard}`],
    [Entity.Scissors]: [`cuts ${Entity.Paper}`, `decapitates ${Entity.Lizard}`],
    [Entity.Paper]: [`covers ${Entity.Rock}`, `disproves ${Entity.Spock}`],
    [Entity.Lizard]: [`poisons ${Entity.Spock}`, `eats ${Entity.Paper}`],
    [Entity.Spock]: [`smashes ${Entity.Scissors}`, `vaporizes ${Entity.Rock}`],
  };

  const findMethod = (move: Entity, opponentMove: any): string | undefined =>
    moveMethods[move].find((method: string | any[]) =>
      method.includes(opponentMove)
    );

  const generateWinner = async (
    winnerId: string,
    loserId: string,
    move: any,
    opponentMove: any
  ): Promise<Winner> => {
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

  if (
    winningMoves[round.moves[0].move as Entity].includes(round.moves[1].move)
  ) {
    return generateWinner(
      (round.moves[0] as any).player,
      (round.moves[1] as any).player,
      round.moves[0].move,
      round.moves[1].move
    );
  }

  if (
    winningMoves[round.moves[1].move as Entity].includes(round.moves[0].move)
  ) {
    return generateWinner(
      (round.moves[1] as any).player,
      (round.moves[0] as any).player,
      round.moves[1].move,
      round.moves[0].move
    );
  }
}

export default GameService;
