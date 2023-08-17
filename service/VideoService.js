const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");

const VideoService = {
  extractAudio: async (video) => {
    try {
      const file = `./temp/${video.originalname}`;
      fs.writeFile(file, video.buffer, () => {
        ffmpeg.setFfmpegPath(ffmpegStatic);
        ffmpeg()
          .input(file)
          .outputOptions("-ab", "192k")
          .saveToFile("./temp/audio.mp3")
          .on("progress", (progress) => {
            if (progress.percent) {
              console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            }
          })
          .on("end", () => {
            console.log("FFmpeg has finished.");
          })
          .on("error", (error) => {
            console.error(error);
          });
      });
    } catch (error) {
      return console.error(error);
    }
  },
};

module.exports = VideoService;
