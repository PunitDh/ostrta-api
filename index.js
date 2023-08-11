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
const SocketEvent = require("./domain/SocketEvent");
const { Status, unauthorizedResponse } = require("./domain/Response");
const { corsOptions } = require("./utils/constants");
const { isAuthenticated, decodeJWT } = require("./utils");
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
   * @param {Boolean} useRoom
   * @returns {*}
   */
  const socketResponse = async (socketEvent, callback, request, useRoom) => {
    const { email } = decodeJWT(request._jwt);
    email && (socketMap[email] = socket.id);
    const response =
      typeof callback === "function" ? await callback(request) : request;
    const target = useRoom ? request.gameId : socket.id;
    useRoom && socket.join(target);
    return io.to(target).emit(socketEvent.response, response);
  };

  /**
   * Unsecured request
   * @param {SocketEvent} socketEvent
   * @param {Function} callback
   * @param {Boolean} useRoom
   */
  const unsecuredResponseTo = function (
    socketEvent,
    callback,
    useRoom = false
  ) {
    socket.on(socketEvent.request, (request) =>
      socketResponse(socketEvent, callback, request, useRoom)
    );
  };

  /**
   * Secured request
   * @param {SocketEvent} socketEvent
   * @param {Function} callback
   * @param {Boolean} useRoom
   */
  const securedResponseTo = function (socketEvent, callback, useRoom = false) {
    socket.on(socketEvent.request, (request) =>
      isAuthenticated(request)
        ? socketResponse(socketEvent, callback, request, useRoom)
        : io.to(socket.id).emit(Status.UNAUTHORIZED, unauthorizedResponse())
    );
  };

  console.log("New connection started with socket ID: ", socket.id);

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

  socket.on("disconnect", async () => {
    await playerService.goOffline(socketMap, socket.id);
  });
});

isProduction &&
  http.listen(port, () => console.log("Server started on port", port));
