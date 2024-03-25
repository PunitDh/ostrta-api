import {
  errorResponse,
  successResponse,
  createdResponse,
} from "../domain/APIResponse";
import ConversationDAO from "../dao/ConversationDAO";
import { conversationMapper } from "../utils/mapper";
import { decodeJWT } from "../utils/security";

const ConversationService = {
  async getConversations(request: { _jwt: string }) {
    try {
      const { id } = decodeJWT(request._jwt);
      const conversations = await ConversationDAO.findAllByPlayerId(id);
      return successResponse(conversations.map(conversationMapper as any));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async startConversation(request: { _jwt: string; player: any }) {
    try {
      const { id: firstPlayer } = decodeJWT(request._jwt);
      const secondPlayer = request.player;
      const conversation = await ConversationDAO.startConversation(
        firstPlayer,
        secondPlayer
      );

      return successResponse(conversationMapper(conversation, firstPlayer));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async sendMessage(request: {
    _jwt: string;
    receiver: any;
    message: any;
    players: any;
  }) {
    try {
      const sender = decodeJWT(request._jwt);
      const conversation = await ConversationDAO.findByPlayerIds(
        request.receiver,
        sender.id
      );

      if (conversation) {
        const updatedConversation = await ConversationDAO.updateWithMessage(
          conversation._id.toString(),
          request.message,
          sender.id
        );
        return successResponse(conversationMapper(updatedConversation));
      }

      const newConversation = await ConversationDAO.createNewConversation(
        request.players,
        request.message,
        sender.id
      );

      return createdResponse(conversationMapper(newConversation));
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  async markAsRead(request: any) {
    const decoded = decodeJWT(request._jwt);
    const conversation = await ConversationDAO.markAsRead(
      request.conversationId,
      decoded.id
    );

    return successResponse(conversationMapper(conversation));
  },
};

export default ConversationService;
