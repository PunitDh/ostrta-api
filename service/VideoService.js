const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const Replicate = require("replicate");
const StorageService = require("./StorageService");
const path = require("path");
const fileUtils = require("../utils/file");
const HttpChatGPTDAO = require("../dao/http/HttpChatGPTDAO");

const VideoService = {
  extractAudio: async (file, location, filename, sendProgressUpdate) => {
    const videoFileName = `./${location}/${file.originalname}`;
    await fs.promises.writeFile(videoFileName, file.buffer);

    sendProgressUpdate("Extracting audio...");
    const audioFileName = `./${location}/${filename}.mp3`;
    ffmpeg.setFfmpegPath(ffmpegStatic);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoFileName)
        .outputOptions("-ab", "192k")
        .saveToFile(audioFileName)
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
          }
        })
        .on("end", () => resolve(audioFileName))
        .on("error", (error) => reject(error));
    });
  },

  extractSubtitles: async (filename, transcriptionFormat) => {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const [_, uploadedFile] = await StorageService.uploadFile(filename);

    const { transcription } = await replicate.run(
      process.env.OPENAI_WHISPER_VERSION,
      {
        input: {
          audio: uploadedFile.mediaLink,
          model: "large-v2",
          transcription: transcriptionFormat,
          temperature: 0,
          condition_on_previous_text: true,
          temperature_increment_on_fallback: 0.2,
          compression_ratio_threshold: 2.4,
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
        },
      }
    );

    return transcription;
  },

  translateSubtitles: async (subtitles, format, language = "English") => {
    if (!subtitles) return "No subtitles found";
    const prompt = `Can you translate these subtitles into ${language} while retaining all the timestamps? Just give me the output, no explanations. Please retain the timestamps in exactly the right places, that's really important! The output must follow the .${format} format. \n\n${subtitles}`;
    return await HttpChatGPTDAO.answer(prompt);
  },

  saveSubtitles: async (subtitles, filename, format) => {
    const fullFileName = filename.concat(`.${format}`);
    const location = path.join("public", fullFileName);
    await fs.promises.writeFile(location, subtitles, "utf-8");
    return fullFileName;
  },

  cleanupTempDir: async () => {
    return await fileUtils.cleanUpDir("./temp");
  },
};

module.exports = VideoService;
