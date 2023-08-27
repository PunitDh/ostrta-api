const HttpChatGPTDAO = require("../dao/http/HttpChatGPTDAO");
const { successResponse } = require("../domain/Response");

const AIService = {
  translate: async (content, language) => {
    const prompt = `Can you translate this text into ${language}? Just give me the output, no explanations - that's really important! \n\n${content}`;
    const response = await HttpChatGPTDAO.answer(prompt);
    return successResponse(response);
  },

  reply: async (content) => {
    if (!content) return "No content found";
    const prompt = `What should I reply to this? \n\n${content}`;
    const response = await HttpChatGPTDAO.answer(prompt);
    return successResponse(response);
  },
};

module.exports = AIService;
