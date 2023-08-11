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
      isOnline: true,
    });
  },
  getNames: async function (playerId) {
    const { firstName, lastName } = await Player.findById(playerId);
    return { firstName, lastName };
  },
  findByIdAndUpdate: async function (playerId, update) {
    const player = await Player.findByIdAndUpdate(playerId, update, {
      returnDocument: "after",
    });
    return player;
  },
  addWin: async function (playerId, win = 1) {
    const player = await Player.findById(playerId);
    player.wins += win;
    await player.save();
    return player;
  },
  addLoss: async function (playerId, loss = 1) {
    const player = await Player.findById(playerId);
    player.losses += loss;
    await player.save();
    return player;
  },
};

module.exports = PlayerDAO;
