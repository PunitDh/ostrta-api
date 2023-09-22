const {
  errorResponse,
  jwtResponse,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} = require("../domain/Response");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");
const PlayerDAO = require("../dao/PlayerDAO");
const GameDAO = require("../dao/GameDAO");
const GameService = require("./GameService");
const ConversationDAO = require("../dao/ConversationDAO");
const { playerMapper, gameMapper } = require("../utils/mapper");
const { decodeJWT } = require("../utils/security");

const PlayerService = {
  async registerPlayer(request) {
    if (request.password !== request.confirmPassword) {
      return errorResponse("Passwords do not match");
    }

    try {
      const player = await PlayerDAO.register(request);
      return jwtResponse(playerMapper(player));
    } catch (error) {
      return error.code === 11000
        ? errorResponse("Email already exists")
        : errorResponse(error.message);
    }
  },

  async loginPlayer(authHeaders, longExpiry = false) {
    try {
      if (!authHeaders) return unauthorizedResponse();
      const [type, credentials] = authHeaders.split(" ");
      if (type !== "Basic") return unauthorizedResponse();

      const [email, password] = Buffer.from(credentials, "base64")
        .toString()
        .split(":");

      const player = await Player.findOne({
        email,
      });

      if (!player) return unauthorizedResponse("Email address not found");

      if (bcrypt.compareSync(password, player.password)) {
        player.isOnline = true;
        await player.save();
        return jwtResponse(playerMapper(player), longExpiry);
      } else {
        return unauthorizedResponse("Passwords do not match");
      }
    } catch (error) {
      return errorResponse(error.message);
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

  async getConversation(request) {
    const { id: playerId } = decodeJWT(request._jwt);
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    if (game) {
      const opponentId = game.players.find((it) => it != playerId);
      const conversation = await ConversationDAO.findByPlayerIds(
        playerId,
        opponentId
      );
      return conversation;
    }
    return notFoundResponse();
  },

  async deleteProfile(request) {
    try {
      const decoded = decodeJWT(request._jwt);
      const player = await Player.findById(decoded.id);

      if (!player) return unauthorizedResponse("Invalid player");

      if (!bcrypt.compareSync(request.password, player.password)) {
        return unauthorizedResponse("Passwords do not match");
      }

      const games = await GameDAO.findByPlayerId(decoded.id);

      for (const game of games) {
        await GameService.deleteGame(game._id);
      }

      await player.deleteOne();

      return successResponse(playerMapper(player));
    } catch (error) {
      return errorResponse("An error occurred while deleting the profile");
    }
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
      if (player) {
        player.isOnline = false;
        await player.save();
        return successResponse(playerMapper(player));
      }
    }
  },

  async goOnline(socketMap, socketId) {
    const email = Object.keys(socketMap).find(
      (key) => socketMap[key] === socketId
    );
    if (email) {
      const player = await Player.findOne({ email });
      if (player) {
        player.isOnline = true;
        await player.save();
        return successResponse(playerMapper(player));
      }
    }
  },
};

module.exports = PlayerService;
