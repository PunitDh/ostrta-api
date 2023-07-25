const { errorResponse, successResponse } = require("../domain/Response");
const JWT = require("jsonwebtoken");
const SocketMessages = require("../socket-messages");
const { verifyJWT } = require("../utils");

const AppService = {
  sendMessages: async (token) => {
    try {
      if (verifyJWT(token)) {
        return successResponse(SocketMessages);
      }
    } catch (error) {
      return errorResponse("Something went wrong");
    }
  },
};

module.exports = AppService;
