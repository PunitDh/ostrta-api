import HttpRestDAO from "../dao/http/HttpRestDAO";

const RestService = {
  async sendRequest(request: any) {
    try {
      const response = await HttpRestDAO.sendRequest(request);
      return response;
    } catch (error) {
      return error;
    }
  },
};

export default RestService;
