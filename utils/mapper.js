const Game = require("../models/Game");
const encoder = require("./encoder");

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

class MoveResponse {
  constructor(move) {
    if (move) {
      this.id = move._id;
      this.move = encoder.encodeString(
        move.move,
        process.env.GAME_ENCRYPTION_KEY
      );
      this.player = move.player;
      this.createdAt = move.createdAt;
      this.updatedAt = move.updatedAt;
    }
  }
}

/**
 *
 * @param {Round} round
 * @returns {MoveResponse}
 */
const moveMapper = (round) => new MoveResponse(round);

class RoundResponse {
  constructor(round) {
    if (round) {
      this.id = round._id;
      this.winner = round.winner;
      this.moves = round.moves.map(moveMapper);
    }
  }
}

/**
 *
 * @param {Round} round
 * @returns {RoundResponse}
 */
const roundMapper = (round) => new RoundResponse(round);

class GameResponse {
  constructor(game) {
    if (game) {
      this.id = game._id;
      this.name = game.name;
      this.icon = game.icon;
      this.players = game.players.map(playerMapper);
      this.rounds = game.rounds.map(roundMapper);
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
  constructor(conversation, opener) {
    if (conversation) {
      this.id = conversation.id || conversation._id;
      this.players = conversation.players.map(playerMapper);
      this.messages = conversation.messages;
      this.createdAt = conversation.createdAt;
      this.updatedAt = conversation.updatedAt;
      if (opener) {
        this.opener = opener;
      }
    }
  }
}

/**
 *
 * @param {Conversation} conversation
 * @returns {ConversationResponse}
 */
const conversationMapper = (conversation, opener) =>
  new ConversationResponse(conversation, opener);

module.exports = {
  playerMapper,
  gameMapper,
  roundMapper,
  conversationMapper,
};
