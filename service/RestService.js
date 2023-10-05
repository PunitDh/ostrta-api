const HttpRestDAO = require("../dao/http/HttpRestDAO");

const RestService = {
  async sendRequest(request) {
    try {
      const response = await HttpRestDAO.sendRequest(request);
      return response;
    } catch (error) {
      return error;
    }
  },
};

module.exports = RestService;
