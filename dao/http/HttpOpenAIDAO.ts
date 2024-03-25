const OpenAI = require("openai");
const fs = require("fs");
const LOGGER = require("../../utils/logger");

const HttpOpenAIDAO = {
  answer: async function (prompt: string): Promise<string> {
    if (!prompt) return "No prompt found";

    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openAI.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });
    return completion.choices[0].message.content;
  },

  transcribe: async function (
    audioFile: string,
    format: string
  ): Promise<string> {
    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openAI.audio.transcriptions.create({
      file: fs.createReadStream(audioFile),
      model: "whisper-1",
      response_format: format,
    });
    return transcription;
  },
};

export default HttpOpenAIDAO;
