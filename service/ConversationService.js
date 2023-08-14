const { errorResponse, successResponse } = require("../domain/Response");
const { conversationMapper } = require("../utils");
const ConversationDAO = require("../dao/ConversationDAO");

const ConversationService = {
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
