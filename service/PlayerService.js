const {
  errorResponse,
  jwtResponse,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
} = require("../domain/Response");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");
const { decodeJWT, playerMapper, gameMapper } = require("../utils");
const PlayerDAO = require("../dao/PlayerDAO");
const GameDAO = require("../dao/GameDAO");

const PlayerService = {
  async registerPlayer(playerInfo) {
    if (playerInfo.password !== playerInfo.confirmPassword) {
      return errorResponse("Passwords do not match");
    }

    try {
      const player = await PlayerDAO.register(playerInfo);
      return jwtResponse(playerMapper(player));
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

      if (!player) {
        return unauthorizedResponse("Email address not found");
      }

      if (bcrypt.compareSync(playerInfo.password, player.password)) {
        player.isOnline = true;
        await player.save();
        return jwtResponse(playerMapper(player));
      } else {
        return unauthorizedResponse("Passwords do not match");
      }
    } catch (error) {
      return errorResponse(error);
    }
  },

  async updateProfile(request) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const player = await PlayerDAO.findByIdAndUpdate(decoded.id, request);
      return jwtResponse(playerMapper(player));
    }
    return forbiddenResponse();
  },

  async deleteProfile(request) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const player = await Player.findById(decoded.id);
      if (bcrypt.compareSync(request.password, player.password)) {
        const games = await GameDAO.findByPlayerId(decoded.id);
        for (const game of games) {
          await GameDAO.closeGame(game._id);
        }
        await player.deleteOne();
      }
      return playerMapper(player);
    }
    return forbiddenResponse();
  },

  async getCurrentGames(request) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const games = await GameDAO.findByPlayerId(decoded.id);
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

  async goOffline(socketMap, socketId) {
    const email = Object.keys(socketMap).find(
      (key) => socketMap[key] === socketId
    );
    if (email) {
      const player = await Player.findOne({ email });
      player.isOnline = false;
      await player.save();
    }
  },

  async goOnline(socketMap, socketId) {
    const email = Object.keys(socketMap).find(
      (key) => socketMap[key] === socketId
    );
    if (email) {
      const player = await Player.findOne({ email });
      player.isOnline = true;
      await player.save();
    }
  },
};

module.exports = PlayerService;
