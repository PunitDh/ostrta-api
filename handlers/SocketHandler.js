const {
  Status,
  unauthorizedResponse,
  forbiddenResponse,
} = require("../domain/Response");
const SocketEvent = require("../domain/SocketEvent");
const adminService = require("../service/AdminService");
const conversationService = require("../service/ConversationService");
const gameService = require("../service/GameService");
const playerService = require("../service/PlayerService");
const LOGGER = require("../utils/logger");
const {
  decodeJWT,
  isAuthenticated,
  isAuthorized,
} = require("../utils/security");

const socketMap = {};

module.exports = (io, app) => {
  io.on(SocketEvent.CONNECTION.request, (socket) => {
    socket.on(SocketEvent.PROGRESS_UPDATE.request, (sessionId) => {
      socketMap[sessionId] = socket.id;
      app.set("socketMap", socketMap);
    });

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
      await playerService.goOnline(socketMap, socket.id);
      const response =
        typeof callback === "function" ? await callback(request) : request;

      const target = useRoom ? request.gameId : socket.id;
      useRoom && socket.join(target);
      return io.to(target).emit(socketEvent.response, response);
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
          ? socketResponse(socketEvent, callback, request, useGameRoom)
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
          ? socketResponse(socketEvent, callback, request, useGameRoom)
          : io.to(socket.id).emit(Status.FORBIDDEN, forbiddenResponse())
      );
    };

    LOGGER.info("New connection started with socket ID: ", socket.id);

    restrictedResponseTo(
      SocketEvent.UPDATE_SITE_SETTINGS,
      adminService.saveSettings
    );
    securedResponseTo(SocketEvent.UPDATE_PROFILE, playerService.updateProfile);
    securedResponseTo(SocketEvent.DELETE_PROFILE, playerService.deleteProfile);
    securedResponseTo(SocketEvent.CREATE_GAME, gameService.createGame);
    securedResponseTo(SocketEvent.RESET_ROUNDS, gameService.resetRounds);
    securedResponseTo(SocketEvent.DELETE_GAME, gameService.deleteGame);
    securedResponseTo(SocketEvent.RENAME_GAME, gameService.renameGame);
    securedResponseTo(SocketEvent.CHANGE_ICON, gameService.changeIcon);
    securedResponseTo(SocketEvent.LOAD_GAME, gameService.loadGame, true);
    securedResponseTo(SocketEvent.PLAY_MOVE, gameService.playMove, true);

    socket.on(SocketEvent.JOIN_CHATS.request, async (request) => {
      const response = await conversationService.getConversations(request);
      console.log("Here", response.payload);
      Array.isArray(response.payload) &&
        response.payload.forEach((conversation) =>
          socket.join(conversation.id)
        );
    });

    socket.on(SocketEvent.JOIN_CHAT.request, async (request) => {
      const conversation = await playerService.getConversation(request);
      conversation && socket.join(conversation.id);
      // console.log(io.sockets.adapter.rooms);
    });

    socket.on(SocketEvent.START_CONVERSATION.request, async (request) => {
      if (!isAuthenticated(request)) {
        return io
          .to(socket.id)
          .emit(Status.UNAUTHORIZED, unauthorizedResponse());
      }

      const response = await conversationService.startConversation(request);
      const target = response.payload.id;
      socket.join(target);
      return io
        .to(target)
        .emit(SocketEvent.START_CONVERSATION.response, response);
    });

    socket.on(SocketEvent.SEND_MESSAGE.request, async (request) => {
      if (!isAuthenticated(request)) {
        return io
          .to(socket.id)
          .emit(Status.UNAUTHORIZED, unauthorizedResponse());
      }

      const response = await conversationService.sendMessage(request);
      const target = response.payload.id;
      socket.join(target);
      // console.log(io.sockets.adapter.rooms);
      return io.to(target).emit(SocketEvent.SEND_MESSAGE.response, response);
    });

    socket.on("disconnect", async () => {
      await playerService.goOffline(socketMap, socket.id);
    });
  });
};
