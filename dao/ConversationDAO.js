const Conversation = require("../models/Conversation");

const ConversationDAO = {
  updateWithMessage: async function (conversationId, content, sender) {
    const conversation = await Conversation.findById(conversationId).populate(
      "players"
    );

    conversation.messages.push({
      content,
      sender,
    });
    await conversation.save();
    return conversation;
  },

  findByPlayer: async function (playerId) {
    const conversations = await Conversation.find({
      players: playerId,
    }).populate("players");

    return conversations;
  },

  findByPlayers: async function (receiver, sender) {
    const conversation = await Conversation.findOne({
      players: { $all: [receiver, sender] },
    });
    return conversation;
  },

  startConversation: async function (firstPlayer, secondPlayer) {
    let conversation = await Conversation.findOne({
      players: { $all: [firstPlayer, secondPlayer] },
    }).populate("players");

    if (conversation) {
      return conversation;
    }

    conversation = await Conversation.create({
      players: [firstPlayer, secondPlayer],
      messages: [],
    });
    const createdConversation = await Conversation.findById(
      conversation._id
    ).populate("players");

    return createdConversation;
  },
};

module.exports = ConversationDAO;
