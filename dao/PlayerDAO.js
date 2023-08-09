const Player = require("../models/Player");
const bcrypt = require("bcrypt");

const PlayerDAO = {
  register: async function (playerInfo) {
    const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));

    return await Player.create({
      firstName: playerInfo.firstName,
      lastName: playerInfo.lastName,
      email: playerInfo.email,
      password: bcrypt.hashSync(playerInfo.password, salt),
      avatar: playerInfo.avatar,
    });
  },
  getNames: async function (playerId) {
    const { firstName, lastName } = await Player.findById(playerId);
    return { firstName, lastName };
  },
};

module.exports = PlayerDAO;
