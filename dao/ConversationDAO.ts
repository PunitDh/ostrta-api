import Conversation from "../models/Conversation";

const ConversationDAO = {
  findById: async function (conversationId: string) {
    return await Conversation.findById(conversationId).populate("players");
  },

  updateWithMessage: async function (
    conversationId: string,
    content: string,
    sender: string
  ) {
    const conversation = await ConversationDAO.findById(conversationId);

    conversation!.messages.push({
      content,
      sender,
    } as any);

    await conversation!.save();
    return conversation;
  },

  markAsRead: async function (conversationId: string, player: string) {
    const conversation = await ConversationDAO.findById(conversationId);
    conversation!.messages
      .filter((message: any) => !message.read && message.sender != player)
      .forEach((message: any) => {
        message.read = true;
      });
    await conversation!.save();
    return conversation;
  },

  findAllByPlayerId: async function (playerId: string) {
    const conversations = await Conversation.find({
      players: playerId,
    }).populate("players");

    return conversations.filter(
      (conversation: any) => conversation.players.length === 2
    );
  },

  findByPlayerIds: async function (receiver: string, sender: string) {
    const conversation = await Conversation.findOne({
      players: { $all: [receiver, sender] },
    }).populate("players");

    return conversation;
  },

  startConversation: async function (
    firstPlayer: string,
    secondPlayer: string
  ) {
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
      conversation._id.toString()
    );

    return createdConversation;
  },

  createNewConversation: async function (
    players: any[],
    message: string,
    sender: string
  ) {
    const createdConversation = await this.startConversation(
      players[0],
      players[1]
    );
    await this.updateWithMessage(
      createdConversation!._id.toString(),
      message,
      sender
    );
    return createdConversation;
  },
};

export default ConversationDAO;
