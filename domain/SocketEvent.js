class SocketEvent {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  // IO
  static CONNECTION = new SocketEvent("connection", "user-connected");
  static DISCONNECT = new SocketEvent("disconnect", "disconnected");

  // PLAYER
  static REGISTER_USER = new SocketEvent("register-user", "user-registered");
  static LOGIN_USER = new SocketEvent("login-user", "user-logged-in");
  static UPDATE_PROFILE = new SocketEvent("update-profile", "profile-updated");
  static DELETE_PROFILE = new SocketEvent("delete-profile", "profile-deleted");

  // GAME
  static CREATE_GAME = new SocketEvent("create-game", "game-created");
  static CURRENT_USERS = new SocketEvent("get-current-users", "current-users");
  static CURRENT_GAMES = new SocketEvent("get-current-games", "current-games");
  static PLAY_MOVE = new SocketEvent("play-move", "move-played");
  static LOAD_GAME = new SocketEvent("load-game", "game-loaded");
  static RENAME_GAME = new SocketEvent("rename-game", "game-renamed");
  static CHANGE_ICON = new SocketEvent("change-icon", "icon-changed");
  static RESET_ROUNDS = new SocketEvent("reset-rounds", "rounds-reset");
  static DELETE_GAME = new SocketEvent("delete-game", "game-deleted");
  static RECENT_GAMES = new SocketEvent("get-recent-games", "recent-games");
}

module.exports = SocketEvent;
