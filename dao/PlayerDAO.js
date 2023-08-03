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
    });
  },
};

module.exports = PlayerDAO;
