const OpenAI = require("openai");
const fs = require("fs");
const LOGGER = require("../../utils/logger");

const HttpOpenAIDAO = {
  answer: async function (prompt) {
    if (!prompt) return "No prompt found";

    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openAI.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });
    return completion.choices[0].message.content;
  },

  transcribe: async function (audioFile, format) {
    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openAI.audio.transcriptions.create({
      file: fs.createReadStream(audioFile),
      model: "whisper-1",
      response_format: format,
    });
    return transcription;
  },
};

module.exports = HttpOpenAIDAO;
