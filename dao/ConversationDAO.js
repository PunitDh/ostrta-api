const Conversation = require("../models/Conversation");

const ConversationDAO = {
  findById: async function (conversationId) {
    return await Conversation.findById(conversationId).populate("players");
  },

  updateWithMessage: async function (conversationId, content, sender) {
    const conversation = await ConversationDAO.findById(conversationId);

    conversation.messages.push({
      content,
      sender,
    });

    await conversation.save();
    return conversation;
  },

  markAsRead: async function (conversationId, player) {
    const conversation = await ConversationDAO.findById(conversationId);
    conversation.messages
      .filter((message) => !message.read && message.sender != player)
      .forEach((message) => {
        message.read = true;
      });
    await conversation.save();
    return conversation;
  },

  findAllByPlayerId: async function (playerId) {
    const conversations = await Conversation.find({
      players: playerId,
    }).populate("players");

    return conversations.filter(
      (conversation) => conversation.players.length === 2
    );
  },

  findByPlayerIds: async function (receiver, sender) {
    const conversation = await Conversation.findOne({
      players: { $all: [receiver, sender] },
    }).populate("players");

    return conversation;
  },

  startConversation: async function (firstPlayer, secondPlayer) {
    let conversation = await ConversationDAO.findByPlayerIds(
      firstPlayer,
      secondPlayer
    );

    if (conversation) {
      return conversation;
    }

    conversation = await Conversation.create({
      players: [firstPlayer, secondPlayer],
      messages: [],
    });

    const createdConversation = await ConversationDAO.findById(
      conversation._id
    );

    return createdConversation;
  },
};

module.exports = ConversationDAO;
