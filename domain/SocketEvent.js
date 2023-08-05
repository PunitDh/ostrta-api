class SocketEvent {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  static REGISTER_USER = new SocketEvent("register-user", "user-registered");
  static LOGIN_USER = new SocketEvent("login-user", "user-logged-in");
  static UPDATE_PROFILE = new SocketEvent("update-profile", "profile-updated");
  static CREATE_GAME = new SocketEvent("create-game", "game-created");
  static CONNECTION = new SocketEvent("connection", "user-connected");
  static DISCONNECT = new SocketEvent("disconnect", "disconnected");
  static PLAY_MOVE = new SocketEvent("play-move", "move-played");
  static CURRENT_GAMES = new SocketEvent("get-current-games", "current-games");
  static LOAD_GAME = new SocketEvent("load-game", "game-loaded");
  static CURRENT_USERS = new SocketEvent("get-current-users", "current-users");
}

module.exports = SocketEvent;
