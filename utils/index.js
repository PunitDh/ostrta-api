const JWT = require("jsonwebtoken");
const Game = require("../models/Game");

/**
 *
 * @param {String} jwt
 * @returns {Object}
 */
const decodeJWT = (jwt) => {
  try {
    return JWT.verify(jwt, process.env.JWT_SECRET);
  } catch (e) {
    return false;
  }
};

/**
 *
 * @param {Object} request
 * @param {String} request._jwt
 * @returns {Boolean}
 */
const isAuthenticated = (request) => Boolean(decodeJWT(request._jwt));

/**
 *
 * @param {Player} player
 * @returns {Object}
 */
const playerMapper = (player) => ({
  id: player._id,
  firstName: player.firstName,
  lastName: player.lastName,
  isOnline: player.isOnline,
  email: player.email,
  avatar: player.avatar,
  isAdmin: player.isAdmin,
  wins: player.wins,
  losses: player.losses,
});

class GameResponse {
  constructor(game) {
    if (game) {
      this.id = game._id;
      this.name = game.name;
      this.icon = game.icon;
      this.players = game.players.map(playerMapper);
      this.rounds = game.rounds;
      this.closed = game.closed;
      this.createdAt = game.createdAt;
      this.updatedAt = game.updatedAt;
    }
  }
}

/**
 *
 * @param {Game} game
 * @returns {GameResponse}
 */
const gameMapper = (game) => new GameResponse(game);

module.exports = {
  decodeJWT,
  playerMapper,
  gameMapper,
  isAuthenticated,
};
