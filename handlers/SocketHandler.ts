import SocketEvent from "../domain/SocketEvent";

import { Status, unauthorizedResponse, forbiddenResponse } from "../domain/Response";
import adminService from "../service/AdminService";
import conversationService from "../service/ConversationService";
import gameService from "../service/GameService";
import playerService from "../service/PlayerService";
import LOGGER from "../utils/logger";
import { decodeJWT, isAuthenticated, isAuthorized } from "../utils/security";
import { Socket } from "socket.io";

const socketMap: any = {};

export default function (io: any, app: any) {
  io.on(SocketEvent.CONNECTION.request, (socket: Socket) => {
    /**
     *
     * @param {SocketEvent} socketEvent
     * @param {Function} callback
     * @param {Object} request
     * @param {Boolean} useRoom
     * @returns {*}
     */
    const socketResponse = async (socketEvent: SocketEvent, callback: any, request: any, useRoom: boolean) => {
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
      socketEvent: SocketEvent,
      callback: any,
      useGameRoom = false
    ) {
      socket.on(socketEvent.request, (request: any) =>
        isAuthenticated(request)
          ? socketResponse(socketEvent, callback, request, useGameRoom)
          : io.to(socket.id).emit(Status.UNAUTHORIZED, unauthorizedResponse())
      );
    };

    const restrictedResponseTo = function (
      socketEvent: SocketEvent,
      callback: any,
      useGameRoom = false
    ) {
      socket.on(socketEvent.request, (request: any) =>
        isAuthorized(request)
          ? socketResponse(socketEvent, callback, request, useGameRoom)
          : io.to(socket.id).emit(Status.FORBIDDEN, forbiddenResponse())
      );
    };

    const securedJoinResponseTo = async function (socketEvent: SocketEvent, callback: any) {
      socket.on(socketEvent.request, async (request: any) => {
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

    socket.on(SocketEvent.JOIN_CHATS.request, async (request: any) => {
      const response = await conversationService.getConversations(request);
      Array.isArray(response.payload) &&
        response.payload.forEach((conversation) =>
          socket.join(conversation.id)
        );
    });

    socket.on(SocketEvent.JOIN_CHAT.request, async (request: any) => {
      const conversation = await playerService.getConversation(request);
      conversation && socket.join((conversation as any).id);
      // console.log(io.sockets.adapter.rooms);
    });

    socket.on(SocketEvent.PROGRESS_UPDATE.request, (request: any) => {
      socketMap[request.sessionId] = socket.id;
      app.set("socketMap", socketMap);
    });

    socket.on("disconnect", async () => {
      await playerService.goOffline(socketMap, socket.id);
    });
  });
};
