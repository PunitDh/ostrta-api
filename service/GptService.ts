import HttpOpenAIDAO from "../dao/http/HttpOpenAIDAO";
import {
  APIResponse,
  errorResponse,
  successResponse,
} from "../domain/APIResponse";

const AIService = {
  translate: async (
    content: string,
    language: string
  ): Promise<APIResponse> => {
    const prompt = `Can you translate this text into ${language}? Just give me the output, no explanations - that's really important! \n\n${content}`;
    const response = await HttpOpenAIDAO.answer(prompt);
    return successResponse(response);
  },

  reply: async (content: string): Promise<APIResponse> => {
    if (!content) return errorResponse("No content found");
    const prompt = `What should I reply to this? \n\n${content}`;
    const response = await HttpOpenAIDAO.answer(prompt);
    return successResponse(response);
  },
};

export default AIService;
