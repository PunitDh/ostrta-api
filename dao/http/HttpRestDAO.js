const axios = require("axios");
const RestResponse = require("../../domain/RestResponse");

const HttpRestDAO = {
  sendRequest: async function (request) {
    if (!request) return "Invalid request";
    const response = await axios(request);
    return new RestResponse(response);
  },
};

module.exports = HttpRestDAO;
