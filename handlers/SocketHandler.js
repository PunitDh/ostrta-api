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

module.exports = function (io, app) {
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
      const player = await playerService.goOnline(socketMap, socket.id);
      if (player) {
        io.emit("online-status-changed", player);
      }
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

    const securedJoinResponseTo = async function (socketEvent, callback) {
      socket.on(socketEvent.request, async (request) => {
        if (isAuthenticated(request)) {
          const response = await callback(request);
          const target = response.payload.id;
          socket.join(target);
          return io.to(target).emit(socketEvent.response, response);
        } else {
          return io
            .to(socket.id)
            .emit(Status.UNAUTHORIZED, unauthorizedResponse());
        }
      });
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

    securedJoinResponseTo(
      SocketEvent.START_CONVERSATION,
      conversationService.startConversation
    );
    securedJoinResponseTo(
      SocketEvent.MARK_AS_READ,
      conversationService.markAsRead
    );
    securedJoinResponseTo(
      SocketEvent.SEND_MESSAGE,
      conversationService.sendMessage
    );

    socket.on(SocketEvent.JOIN_CHATS.request, async (request) => {
      const response = await conversationService.getConversations(request);
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

    socket.on(SocketEvent.PROGRESS_UPDATE.request, (request) => {
      socketMap[request.sessionId] = socket.id;
      app.set("socketMap", socketMap);
    });

    socket.on("disconnect", async () => {
      await playerService.goOffline(socketMap, socket.id);
    });
  });
};
