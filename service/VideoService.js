const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fileUtils = require("../utils/file");
const HttpOpenAIDAO = require("../dao/http/HttpOpenAIDAO");

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
    return await HttpOpenAIDAO.transcribe(filename, transcriptionFormat);
  },

  translateSubtitles: async (subtitles, format, language = "English") => {
    if (!subtitles) return "No subtitles found";
    const prompt = `Can you translate these subtitles into ${language} while retaining all the timestamps? Just give me the output, no explanations. Please retain the timestamps in exactly the right places, that's really important! The output must follow the .${format} format. \n\n${subtitles}`;
    return await HttpOpenAIDAO.answer(prompt);
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
