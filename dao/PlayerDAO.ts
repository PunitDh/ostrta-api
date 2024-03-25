const Player = require("../models/Player");
const bcrypt = require("bcrypt");

const PlayerDAO = {
  register: async function (request: any) {
    const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));

    return await Player.create({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: bcrypt.hashSync(request.password, salt),
      avatar: request.avatar,
      isOnline: true,
    });
  },
  getNames: async function (playerId: string) {
    const { firstName, lastName } = await Player.findById(playerId);
    return { firstName, lastName };
  },
  findByIdAndUpdate: async function (playerId: string, update: any) {
    const player = await Player.findByIdAndUpdate(playerId, update, {
      returnDocument: "after",
    });
    return player;
  },
  addWin: async function (playerId: string, win = 1) {
    const player = await Player.findById(playerId);
    player.wins += win;
    await player.save();
    return player;
  },
  addLoss: async function (playerId: string, loss = 1) {
    const player = await Player.findById(playerId);
    player.losses += loss;
    await player.save();
    return player;
  },
};

export default PlayerDAO;
