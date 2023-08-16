const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
require("dotenv").config();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const mongoose = require("./db");
const playerService = require("./service/PlayerService");
const gameService = require("./service/GameService");
const conversationService = require("./service/ConversationService");
const SocketEvent = require("./domain/SocketEvent");
const {
  Status,
  unauthorizedResponse,
  forbiddenResponse,
} = require("./domain/Response");
const { corsOptions } = require("./utils/constants");
const { isAuthenticated, decodeJWT, isAuthorized } = require("./utils");
const adminService = require("./service/AdminService");
let io;

app.use(cors(corsOptions));

if (isProduction) {
  io = require("socket.io")(http);
  console.log("Web socket server started in production");
} else {
  io = require("socket.io")(port, { cors: corsOptions });
  console.log("Web socket server started locally");
}

mongoose.connectToDB();

const socketMap = {};

io.on(SocketEvent.CONNECTION.request, (socket) => {
  /**
   *
   * @param {SocketEvent} socketEvent
   * @param {Function} callback
   * @param {Object} request
   * @param {Boolean} useGameRoom
   * @returns {*}
   */
  const socketResponse = async (
    secured,
    socketEvent,
    callback,
    request,
    useGameRoom
  ) => {
    if (secured) {
      const { email } = decodeJWT(request._jwt);
      email && (socketMap[email] = socket.id);
      await playerService.goOnline(socketMap, socket.id);
    }
    const response =
      typeof callback === "function" ? await callback(request) : request;
    const target = useGameRoom ? request.gameId : socket.id;
    useGameRoom && socket.join(target);
    return io.to(target).emit(socketEvent.response, response);
  };

  /**
   * Unsecured request
   * @param {SocketEvent} socketEvent
   * @param {Function} callback
   * @param {Boolean} useGameRoom
   */
  const unsecuredResponseTo = function (
    socketEvent,
    callback,
    useGameRoom = false
  ) {
    socket.on(socketEvent.request, (request) =>
      socketResponse(false, socketEvent, callback, request, useGameRoom)
    );
  };

  /**
   * Secured request
   * @param {SocketEvent} socketEvent
   * @param {Function} callback
   * @param {Boolean} useGameRoom
   */
  const securedResponseTo = function (
    socketEvent,
    callback,
    useGameRoom = false
  ) {
    socket.on(socketEvent.request, (request) =>
      isAuthenticated(request)
        ? socketResponse(true, socketEvent, callback, request, useGameRoom)
        : io.to(socket.id).emit(Status.UNAUTHORIZED, unauthorizedResponse())
    );
  };

  const restrictedResponseTo = function (
    socketEvent,
    callback,
    useGameRoom = false
  ) {
    socket.on(socketEvent.request, (request) =>
      isAuthorized(request)
        ? socketResponse(true, socketEvent, callback, request, useGameRoom)
        : io.to(socket.id).emit(Status.FORBIDDEN, forbiddenResponse())
    );
  };

  console.log("New connection started with socket ID: ", socket.id);

  unsecuredResponseTo(SocketEvent.GET_SITE_SETTINGS, adminService.getSettings);
  restrictedResponseTo(
    SocketEvent.UPDATE_SITE_SETTINGS,
    adminService.saveSettings
  );

  unsecuredResponseTo(SocketEvent.REGISTER_USER, playerService.registerPlayer);
  unsecuredResponseTo(SocketEvent.LOGIN_USER, playerService.loginPlayer);

  securedResponseTo(SocketEvent.UPDATE_PROFILE, playerService.updateProfile);
  securedResponseTo(SocketEvent.DELETE_PROFILE, playerService.deleteProfile);

  securedResponseTo(SocketEvent.CREATE_GAME, gameService.createGame);
  securedResponseTo(SocketEvent.CURRENT_GAMES, playerService.getCurrentGames);
  securedResponseTo(SocketEvent.CURRENT_USERS, playerService.getOnlineUsers);
  securedResponseTo(SocketEvent.RESET_ROUNDS, gameService.resetRounds);
  securedResponseTo(SocketEvent.DELETE_GAME, gameService.deleteGame);
  securedResponseTo(SocketEvent.RECENT_GAMES, gameService.getRecentGames);
  securedResponseTo(SocketEvent.RENAME_GAME, gameService.renameGame);
  securedResponseTo(SocketEvent.CHANGE_ICON, gameService.changeIcon);

  securedResponseTo(SocketEvent.LOAD_GAME, gameService.loadGame, true);
  securedResponseTo(SocketEvent.PLAY_MOVE, gameService.playMove, true);
  securedResponseTo(
    SocketEvent.START_CONVERSATION,
    conversationService.startConversation
  );

  socket.on(SocketEvent.SEND_MESSAGE.request, async (request) => {
    if (!isAuthenticated(request)) {
      return io.to(socket.id).emit(Status.UNAUTHORIZED, unauthorizedResponse());
    }

    const response = await conversationService.sendMessage(request);
    const target = request.conversationId;
    socket.join(target);
    return io.to(target).emit(SocketEvent.SEND_MESSAGE.response, response);
  });

  socket.on("disconnect", async () => {
    await playerService.goOffline(socketMap, socket.id);
  });
});

isProduction &&
  http.listen(port, () => console.log("Server started on port", port));
