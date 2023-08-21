const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const Replicate = require("replicate");
const StorageService = require("./StorageService");
const axios = require("axios");
const path = require("path");
const fileUtils = require("../utils/fileUtils");

const VideoService = {
  extractAudio: async (file, filename, sendProgressUpdate) => {
    const videoFileName = `./temp/${file.originalname}`;
    await fs.promises.writeFile(videoFileName, file.buffer);

    sendProgressUpdate("Extracting audio...");
    const audioFileName = `./temp/${filename}.mp3`;
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

  extractSubtitles: async (filename) => {
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
          transcription: "srt",
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

  translateSubtitles: async (subtitles, language = "English") => {
    if (!subtitles) return "No subtitles found";
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Can you translate these subtitles into ${language} while retaining all the timestamps? Just give me the output, no explanations. Please retain the timestamps in exactly the right places, that's really important! The output must follow the .srt format. \n\n${subtitles}`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  },

  saveSubtitles: async (subtitles, filename) => {
    const fullFileName = filename.concat(".srt");
    const location = path.join("public", fullFileName);
    await fs.promises.writeFile(location, subtitles, "utf-8");
    return fullFileName;
  },

  cleanupTempDir: async () => {
    return await fileUtils.cleanUpDir("./temp");
  },
};

module.exports = VideoService;
