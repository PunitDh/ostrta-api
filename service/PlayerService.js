const {
  errorResponse,
  jwtResponse,
  successResponse,
  unauthorizedResponse,
} = require("../domain/Response");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");
const { decodeJWT, playerMapper, gameMapper } = require("../utils");
const Game = require("../models/Game");
const PlayerDAO = require("../dao/PlayerDAO");

const PlayerService = {
  async registerPlayer(playerInfo) {
    if (playerInfo.password !== playerInfo.confirmPassword) {
      return errorResponse("Passwords do not match");
    }

    try {
      const player = await PlayerDAO.register(playerInfo);
      const createdPlayer = playerMapper(player);
      return jwtResponse(createdPlayer);
    } catch (error) {
      return error.code === 11000
        ? errorResponse("Email already exists")
        : errorResponse(error.message);
    }
  },

  async loginPlayer(playerInfo) {
    try {
      const player = await Player.findOne({
        email: playerInfo.email,
      });

      if (bcrypt.compareSync(playerInfo.password, player.password)) {
        return jwtResponse(playerMapper(player));
      } else {
        return unauthorizedResponse("Passwords do not match");
      }
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getCurrentGames(request) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const playerId = decoded.id;
      const games = await Game.find({
        players: playerId,
        closed: false,
      });

      return successResponse(games.map(gameMapper));
    }
    return unauthorizedResponse();
  },

  async getOnlineUsers(request) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const players = await Player.find();
      const currentOnlinePlayers = players
        .filter((player) => player.id !== decoded.id)
        .map(playerMapper);

      return successResponse(currentOnlinePlayers);
    }
    return unauthorizedResponse();
  },
};

module.exports = PlayerService;
