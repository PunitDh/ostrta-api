const {
  errorResponse,
  jwtResponse,
  successResponse,
} = require("../domain/Response");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { verifyJWT } = require("../utils");

const PlayerService = {
  registerPlayer: async (playerInfo) => {
    if (playerInfo.password !== playerInfo.confirmPassword) {
      return errorResponse("Passwords do not match");
    }

    try {
      const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
      const player = await Player.create({
        name: playerInfo.name,
        email: playerInfo.email,
        password: bcrypt.hashSync(playerInfo.password, salt),
      });

      const createdPlayer = {
        name: player.name,
        email: player.email,
        id: player.id,
        games: player.games,
      };

      return jwtResponse(createdPlayer);
    } catch (error) {
      if (error.code === 11000) {
        return errorResponse("Email already exists");
      } else {
        return errorResponse(error.message);
      }
    }
  },

  loginPlayer: async (playerInfo) => {
    try {
      const player = await Player.findOne({
        email: playerInfo.email,
      });

      if (bcrypt.compareSync(playerInfo.password, player.password)) {
        const loggedInPlayer = {
          name: player.name,
          email: player.email,
          id: player.id,
          games: player.games,
        };

        return jwtResponse(loggedInPlayer);
      } else {
        return errorResponse("Passwords do not match");
      }
    } catch (error) {
      return errorResponse(error);
    }
  },

  getCurrentGames: (request) => {
    const decoded = JWT.decode(request._jwt);
    return successResponse(decoded);
  },

  getOnlineUsers: async (request) => {
    const decoded = verifyJWT(request._jwt);
    if (decoded) {
      const players = await Player.find();
      const currentOnlinePlayers = players
        .filter((player) => player.id !== decoded.id)
        .map((player) => ({
          id: player.id,
          name: player.name,
          isOnline: player.isOnline,
          email: player.email,
        }));

      return successResponse(currentOnlinePlayers);
    }
    return errorResponse("Invalid request");
  },
};

module.exports = PlayerService;
