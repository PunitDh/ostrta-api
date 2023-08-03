const { errorResponse, successResponse } = require("../domain/Response");
const SocketMessages = require("../socket-messages");
const { decodeJWT } = require("../utils");

const AppService = {
  sendMessages: async (token) => {
    try {
      if (decodeJWT(token)) {
        return successResponse(SocketMessages);
      }
    } catch (error) {
      return errorResponse("Something went wrong");
    }
  },
};

module.exports = AppService;
