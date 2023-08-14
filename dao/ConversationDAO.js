const Conversation = require("../models/Conversation");

const ConversationDAO = {
  updateWithMessage: async function (conversationId, message, sender) {
    const conversation = await Conversation.findById(conversationId);
    conversation.messages.push({
      message,
      sender,
    });
    await conversation.save();
    return conversation.populate("players").exec();
  },

  findByPlayers: async function (receiver, sender) {
    const conversation = await Conversation.find({
      players: [receiver, sender],
    });
    return conversation.populate("players").exec();
  },

  createNewConversation: async function (players, message, sender) {
    const conversation = await Conversation.create({
      players,
      messages: [{ message, sender }],
    });

    return conversation.populate("players").exec();
  },
};

module.exports = ConversationDAO;
