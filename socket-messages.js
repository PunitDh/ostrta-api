const { message } = require("./domain/Message");

module.exports = {
  REGISTER_USER: message("register-user", "user-registered"),
  LOGIN_USER: message("login-user", "user-logged-in"),
  CREATE_GAME: message("create-game", "game-created"),
  CONNECTION: message("connection", "user-connected"),
  DISCONNECT: message("disconnect", "disconnected"),
  PLAY_MOVE: message("play-move", "move-played"),
};
