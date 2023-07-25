const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
require("dotenv").config();
const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === "production";
const SocketMessage = require("./socket-messages");
const mongoose = require("./db");
const playerService = require("./service/PlayerService");
const gameService = require("./service/GameService");
const { Message } = require("./domain/Message");
let io;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

if (isProduction) {
  io = require("socket.io")(http);
  console.log("Web socket server started in production");
} else {
  io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });
  console.log("Web socket server started locally");
}

mongoose.connectToDB();

io.on(SocketMessage.CONNECTION.request, (socket) => {
  const emitToSocket = (message, ...args) => {
    console.log(message, ...args);
    return io.to(socket.id).emit(message, ...args);
  };

  /**
   *
   * @param {Message} message
   * @param {Function} callback
   */
  socket.respondTo = function (message, callback) {
    this.on(message.request, async (arg) => {
      let response;
      response = typeof callback === "function" ? await callback(arg) : arg;
      return emitToSocket(message.response, response);
    });
  };

  console.log("New connection started with socket ID: ", socket.id);

  socket.respondTo(SocketMessage.REGISTER_USER, playerService.registerPlayer);
  socket.respondTo(SocketMessage.LOGIN_USER, playerService.loginPlayer);
  socket.respondTo(SocketMessage.CREATE_GAME, gameService.createGame);
  socket.respondTo(SocketMessage.PLAY_MOVE);
  socket.respondTo(SocketMessage.DISCONNECT);
});

isProduction &&
  http.listen(port, () => console.log("Server started on port", port));
