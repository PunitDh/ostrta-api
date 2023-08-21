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

const isAuthorized = (request) => Boolean(decodeJWT(request._jwt).isAdmin);

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
  hidden: player.hidden,
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

class ConversationResponse {
  constructor(conversation) {
    if (conversation) {
      this.id = conversation.id || conversation._id;
      this.players = conversation.players.map(playerMapper);
      this.messages = conversation.messages;
    }
  }
}

/**
 *
 * @param {Conversation} conversation
 * @returns {ConversationResponse}
 */
const conversationMapper = (conversation) =>
  new ConversationResponse(conversation);

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);

function convertToMilliseconds(time) {
  const [seconds, nanoseconds] = time;
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  return Math.round(milliseconds * 100) / 100;
}

module.exports = {
  decodeJWT,
  playerMapper,
  gameMapper,
  conversationMapper,
  isAuthenticated,
  isAuthorized,
  formatDate,
  convertToMilliseconds,
};
