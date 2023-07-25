const { message } = require("./domain/Message");

module.exports = {
  GET_MESSAGES: message("get-messages", "messages"),
  REGISTER_USER: message("register-user", "user-registered"),
  LOGIN_USER: message("login-user", "user-logged-in"),
  CREATE_GAME: message("create-game", "game-created"),
  CONNECTION: message("connection", "user-connected"),
  DISCONNECT: message("disconnect", "disconnected"),
  PLAY_MOVE: message("play-move", "move-played"),
  CURRENT_GAMES: message("get-current-games", "current-games"),
  CURRENT_USERS: message("get-current-users", "current-users"),
};
