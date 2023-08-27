const {
  errorResponse,
  successResponse,
  createdResponse,
} = require("../domain/Response");
const ConversationDAO = require("../dao/ConversationDAO");
const { conversationMapper } = require("../utils/mapper");
const { decodeJWT } = require("../utils/security");

const ConversationService = {
  async getConversations(request) {
    try {
      const { id } = decodeJWT(request._jwt);
      const conversations = await ConversationDAO.findAllByPlayerId(id);
      return successResponse(conversations.map(conversationMapper));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async startConversation(request) {
    try {
      const { id: firstPlayer } = decodeJWT(request._jwt);
      const secondPlayer = request.player;
      const conversation = await ConversationDAO.startConversation(
        firstPlayer,
        secondPlayer
      );

      return successResponse(conversationMapper(conversation));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async sendMessage(request) {
    try {
      const sender = decodeJWT(request._jwt);
      const conversation = await ConversationDAO.findByPlayerIds(
        request.receiver,
        sender.id
      );

      if (conversation) {
        const updatedConversation = await ConversationDAO.updateWithMessage(
          conversation._id,
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
    } catch (error) {
      return errorResponse(error);
    }
  },

  async markAsRead(request) {
    const decoded = decodeJWT(request._jwt);
    const conversation = await ConversationDAO.markAsRead(
      request.conversationId,
      decoded.id
    );

    return successResponse(conversationMapper(conversation));
  },
};

module.exports = ConversationService;
