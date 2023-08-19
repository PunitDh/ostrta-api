const fs = require("fs");
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
  cleanupPublicDir: () => {
    setInterval(async () => {
      const files = (await fs.promises.readdir("./public")).filter(
        (file) => file !== ".keep"
      );
      for (const file of files) {
        await fs.promises.rm(`./public/${file}`);
        console.log(`Cleaned ./public/${file}`);
      }
    }, 1000 * 3600 * 24);
    return true;
  },
};

module.exports = AppService;
