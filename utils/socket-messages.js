const { socketMessage } = require("../domain/Message");

module.exports = {
  REGISTER_USER: socketMessage("register-user", "user-registered"),
  LOGIN_USER: socketMessage("login-user", "user-logged-in"),
  CREATE_GAME: socketMessage("create-game", "game-created"),
  CONNECTION: socketMessage("connection", "user-connected"),
  DISCONNECT: socketMessage("disconnect", "disconnected"),
  PLAY_MOVE: socketMessage("play-move", "move-played"),
  CURRENT_GAMES: socketMessage("get-current-games", "current-games"),
  LOAD_GAME: socketMessage("load-game", "game-loaded"),
  CURRENT_USERS: socketMessage("get-current-users", "current-users"),
};
