const { errorResponse, jwtResponse } = require("../domain/Response");
const Player = require("../models/Player");
const bcrypt = require("bcrypt");

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
        id: player._id,
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

module.exports = PlayerService;
