import axios from "axios";
import RestResponse from "../../domain/RestResponse";

const HttpRestDAO = {
  sendRequest: async function (request: any) {
    if (!request) return "Invalid request";
    const response = await axios(request);
    return new RestResponse(response);
  },
};

export default HttpRestDAO;
