const { errorResponse, successResponse } = require("../domain/Response");
const Game = require("../models/Game");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");

const GameService = {
  createGame: async (gameInfo) => {
    try {
      const game = await Game.create({
        name: gameInfo.name,
        players: gameInfo.players,
      });

      const createdGame = {
        name: game.name,
        id: game._id,
      };

      return successResponse(createdGame);
    } catch (error) {
      return errorResponse(error.message);
    }
  },

  rename: async (playerInfo) => {
    try {
      const player = await Player.findOne({
        email: playerInfo.email,
      });

      if (bcrypt.compareSync(playerInfo.password, player.password)) {
        const loggedInPlayer = {
          name: player.name,
          email: player.email,
          id: player._id,
        };

        return jwtResponse(loggedInPlayer);
      } else {
        return errorResponse("Passwords do not match");
      }
    } catch (error) {
      return errorResponse(error);
    }
  },
};

module.exports = GameService;
