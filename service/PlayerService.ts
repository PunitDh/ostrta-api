import {
  errorResponse,
  jwtResponse,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "../domain/APIResponse";
import Player from "../models/Player";
import bcrypt from "bcrypt";
import PlayerDAO from "../dao/PlayerDAO";
import GameDAO from "../dao/GameDAO";
import GameService from "./GameService";
import ConversationDAO from "../dao/ConversationDAO";
import { playerMapper, gameMapper } from "../utils/mapper";
import { decodeJWT } from "../utils/security";

const PlayerService = {
  async registerPlayer(request: { password: any; confirmPassword: any }) {
    if (request.password !== request.confirmPassword) {
      return errorResponse("Passwords do not match");
    }

    try {
      const player = await PlayerDAO.register(request);
      return jwtResponse(playerMapper(player));
    } catch (error: any) {
      return error.code === 11000
        ? errorResponse("Email already exists")
        : errorResponse(error.message);
    }
  },

  async loginPlayer(authHeaders: string, longExpiry = false) {
    try {
      if (!authHeaders) return unauthorizedResponse();
      const [type, credentials] = authHeaders.split(" ");
      if (type !== "Basic") return unauthorizedResponse();

      const [email, password] = Buffer.from(credentials, "base64")
        .toString()
        .split(":");

      const player = await Player.findOne({
        email,
      });

      if (!player) return unauthorizedResponse("Email address not found");

      if (bcrypt.compareSync(password, player.password)) {
        player.isOnline = true;
        await player.save();
        return jwtResponse(playerMapper(player as any), longExpiry);
      } else {
        return unauthorizedResponse("Passwords do not match");
      }
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async updateProfile(request: { _jwt: string }) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const player = await PlayerDAO.findByIdAndUpdate(decoded.id, request);
      return jwtResponse(playerMapper(player));
    }
    return forbiddenResponse();
  },

  async getConversation(request: { _jwt: string; gameId: any }) {
    const { id: playerId } = decodeJWT(request._jwt);
    const game = await GameDAO.findByIdAndPopulate(request.gameId);
    if (game) {
      const opponentId = game.players.find((it: any) => it != playerId);
      const conversation = await ConversationDAO.findByPlayerIds(
        playerId,
        opponentId!.toString()
      );
      return conversation;
    }
    return notFoundResponse();
  },

  async deleteProfile(request: { _jwt: string; password: string | Buffer }) {
    try {
      const decoded = decodeJWT(request._jwt);
      const player = await Player.findById(decoded.id);

      if (!player) return unauthorizedResponse("Invalid player");

      if (!bcrypt.compareSync(request.password, player.password)) {
        return unauthorizedResponse("Passwords do not match");
      }

      const games = await GameDAO.findByPlayerId(decoded.id);

      for (const game of games) {
        await GameService.deleteGame({ gameId: game._id.toString() });
      }

      await player.deleteOne();

      return successResponse(playerMapper(player as any));
    } catch (error) {
      return errorResponse("An error occurred while deleting the profile");
    }
  },

  async getCurrentGames(request: { _jwt: string }) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const games = await GameDAO.findByPlayerId(decoded.id);
      return successResponse(games.map(gameMapper));
    }
    return unauthorizedResponse();
  },

  async getOnlineUsers(request: { _jwt: string }) {
    const decoded = decodeJWT(request._jwt);
    if (decoded) {
      const players = await Player.find();
      const currentOnlinePlayers = players
        .filter((player) => player.id !== decoded.id)
        .map(playerMapper as any);

      return successResponse(currentOnlinePlayers);
    }
    return unauthorizedResponse();
  },

  async goOffline(socketMap: { [x: string]: any }, socketId: any) {
    const email = Object.keys(socketMap).find(
      (key) => socketMap[key] === socketId
    );
    if (email) {
      const player = await Player.findOne({ email });
      if (player) {
        player.isOnline = false;
        await player.save();
        return successResponse(playerMapper(player as any));
      }
    }
  },

  async goOnline(socketMap: { [x: string]: any }, socketId: any) {
    const email = Object.keys(socketMap).find(
      (key) => socketMap[key] === socketId
    );
    if (email) {
      const player = await Player.findOne({ email });
      if (player) {
        player.isOnline = true;
        await player.save();
        return successResponse(playerMapper(player as any));
      }
    }
  },
};

export default PlayerService;
