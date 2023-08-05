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
const { isAuthenticated } = require("./utils");
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

io.on(SocketEvent.CONNECTION.request, (socket) => {
  /**
   *
   * @param {String} message
   * @param  {...any} args
   */
  const emitToSocket = (message, ...args) => {
    console.log(message, ...args);
    return io.to(socket.id).emit(message, ...args);
  };

  /**
   *
   * @param {SocketEvent} event
   * @param {Function} callback
   */
  const respondTo = function (event, callback, secured = true) {
    socket.on(event.request, async (request) => {
      let response;
      response =
        typeof callback === "function" ? await callback(request) : request;

      if (secured) {
        if (isAuthenticated(request)) {
          response =
            typeof callback === "function" ? await callback(request) : request;
        } else {
          response = unauthorizedResponse();
        }
      } else {
        response =
          typeof callback === "function" ? await callback(request) : request;
      }
      if (response.status === Status.UNAUTHORIZED) {
        return emitToSocket(Status.UNAUTHORIZED, response);
      }
      return emitToSocket(event.response, response);
    });
  };

  console.log("New connection started with socket ID: ", socket.id);

  respondTo(SocketEvent.REGISTER_USER, playerService.registerPlayer, false);
  respondTo(SocketEvent.LOGIN_USER, playerService.loginPlayer, false);
  respondTo(SocketEvent.UPDATE_PROFILE, playerService.updateProfile);
  respondTo(SocketEvent.CREATE_GAME, gameService.createGame);
  respondTo(SocketEvent.CURRENT_GAMES, playerService.getCurrentGames);
  respondTo(SocketEvent.CURRENT_USERS, playerService.getOnlineUsers);
  respondTo(SocketEvent.LOAD_GAME, gameService.loadGame);

  socket.on(SocketEvent.PLAY_MOVE.request, async (request) => {
    const response = await gameService.playMove(request);
    socket.join(request.gameId);
    console.log(io.sockets.adapter.rooms);
    return io.to(request.gameId).emit(SocketEvent.PLAY_MOVE.response, response);
  });

  respondTo(SocketEvent.DISCONNECT);
});

isProduction &&
  http.listen(port, () => console.log("Server started on port", port));
