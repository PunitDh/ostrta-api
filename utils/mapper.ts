import encoder from "./encoder";

export type RawPlayer = {
  _id: string;
  firstName: string;
  lastName: string;
  isOnline: boolean;
  email: string;
  avatar: number;
  hidden: boolean;
  isAdmin: boolean;
  wins: number;
  losses: number;
};

/**
 *
 * @param {Player} player
 * @returns {Object}
 */
export const playerMapper = (
  player: RawPlayer
): {
  id: string;
  firstName: string;
  lastName: string;
  isOnline: boolean;
  email: string;
  avatar: number;
  hidden: boolean;
  isAdmin: boolean;
  wins: number;
  losses: number;
} => ({
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
  move!: string;
  player: any;
  createdAt: any;
  updatedAt: any;
  constructor(move: {
    move: string;
    player: any;
    createdAt: any;
    updatedAt: any;
  }) {
    if (move) {
      // this.id = move._id;
      this.move = encoder.encodeString(
        move.move,
        process.env.GAME_ENCRYPTION_KEY!
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
const moveMapper = (round: any): MoveResponse => new MoveResponse(round);

class RoundResponse {
  id: any;
  winner: any;
  moves: MoveResponse[] = [];
  constructor(round: { _id: any; winner: any; moves: any[] }) {
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
export const roundMapper = (round: any): RoundResponse =>
  new RoundResponse(round);

class GameResponse {
  id: any;
  name: any;
  icon: any;
  players: {
    id: string;
    firstName: string;
    lastName: string;
    isOnline: boolean;
    email: string;
    avatar: number;
    hidden: boolean;
    isAdmin: boolean;
    wins: number;
    losses: number;
  }[] = [];
  rounds: RoundResponse[] = [];
  closed: any;
  createdAt: any;
  updatedAt: any;
  constructor(game: {
    _id: any;
    name: any;
    icon: any;
    players: any[];
    rounds: any[];
    closed: any;
    createdAt: any;
    updatedAt: any;
  }) {
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
export const gameMapper = (game: any): GameResponse => new GameResponse(game);

class ConversationResponse {
  id: any;
  players: {
    id: string;
    firstName: string;
    lastName: string;
    isOnline: boolean;
    email: string;
    avatar: number;
    hidden: boolean;
    isAdmin: boolean;
    wins: number;
    losses: number;
  }[] = [];
  messages: any;
  createdAt: any;
  updatedAt: any;
  opener?: string;
  constructor(
    conversation: {
      id: any;
      _id: any;
      players: any[];
      messages: any;
      createdAt: any;
      updatedAt: any;
    },
    opener: string
  ) {
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
export const conversationMapper = (
  conversation: any,
  opener = ""
): ConversationResponse => new ConversationResponse(conversation, opener);
