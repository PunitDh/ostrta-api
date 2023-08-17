const {
  unauthorizedResponse,
  Status,
  forbiddenResponse,
} = require("../domain/Response");
const SocketEvent = require("../domain/SocketEvent");
const adminService = require("../service/AdminService");
const conversationService = require("../service/ConversationService");
const gameService = require("../service/GameService");
const playerService = require("../service/PlayerService");
const { isAuthenticated, decodeJWT } = require("../utils");

const socketMap = {};

module.exports = (io) => {
  io.on(SocketEvent.CONNECTION.request, (socket) => {
    /**
     *
     * @param {SocketEvent} socketEvent
     * @param {Function} callback
     * @param {Object} request
     * @param {Boolean} useRoom
     * @returns {*}
     */
    const socketResponse = async (
      secured,
      socketEvent,
      callback,
      request,
      useRoom
    ) => {
      if (secured) {
        const { email } = decodeJWT(request._jwt);
        email && (socketMap[email] = socket.id);
        await playerService.goOnline(socketMap, socket.id);
      }
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

    unsecuredResponseTo(
      SocketEvent.GET_SITE_SETTINGS,
      adminService.getSettings
    );
    restrictedResponseTo(
      SocketEvent.UPDATE_SITE_SETTINGS,
      adminService.saveSettings
    );

    unsecuredResponseTo(
      SocketEvent.REGISTER_USER,
      playerService.registerPlayer
    );
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

    socket.on(SocketEvent.GET_CONVERSATIONS.request, async (request) => {
      if (!isAuthenticated(request)) {
        return io
          .to(socket.id)
          .emit(Status.UNAUTHORIZED, unauthorizedResponse());
      }

      const response = await conversationService.getConversations(request);
      response.payload.forEach((conversation) => socket.join(conversation.id));
      // console.log(io.sockets.adapter.rooms);
      return io
        .to(socket.id)
        .emit(SocketEvent.GET_CONVERSATIONS.response, response);
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
      return io.to(target).emit(SocketEvent.SEND_MESSAGE.response, response);
    });

    socket.on("disconnect", async () => {
      await playerService.goOffline(socketMap, socket.id);
    });
  });
};
