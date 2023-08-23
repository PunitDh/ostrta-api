const { errorResponse, successResponse } = require("../domain/Response");
const ConversationDAO = require("../dao/ConversationDAO");
const { conversationMapper } = require("../utils/mapper");
const { decodeJWT } = require("../utils/security");

const ConversationService = {
  async getConversations(request) {
    try {
      const { id } = decodeJWT(request);
      const conversations = await ConversationDAO.findByPlayer(id);
      return successResponse(conversations.map(conversationMapper));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async startConversation(request) {
    try {
      const firstPlayer = decodeJWT(request._jwt).id;
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
      const conversation = await ConversationDAO.findByPlayers(
        request.receiver,
        request.sender
      );

      if (conversation) {
        const updatedConversation = await ConversationDAO.updateWithMessage(
          conversation._id,
          request.message,
          request.sender
        );
        return successResponse(conversationMapper(updatedConversation));
      }

      const newConversation = await ConversationDAO.createNewConversation(
        request.players,
        request.message,
        request.sender
      );

      return successResponse(conversationMapper(newConversation));
    } catch (error) {
      return errorResponse(error);
    }
  },
};

module.exports = ConversationService;
