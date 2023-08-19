const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const Replicate = require("replicate");
const StorageService = require("./StorageService");
const axios = require("axios");
const path = require("path");

const VideoService = {
  extractSubtitles: async (video) => {
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      const file = `./temp/${video.originalname}`;
      const audioFile = `./temp/audio.mp3`;

      await fs.promises.writeFile(file, video.buffer);

      ffmpeg.setFfmpegPath(ffmpegStatic);

      ffmpeg().input(file).outputOptions("-ab", "192k").saveToFile(audioFile);
      // .on("progress", (progress) => {
      //   if (progress.percent) {
      //     console.log(`Processing: ${Math.floor(progress.percent)}% done`);
      //   }
      // })
      // .on("end", () => {
      //   console.log("FFmpeg has finished.");
      // })
      // .on("error", (error) => {
      //   console.error(error);
      // });

      const [uploadedFile, uploadedObject] = await StorageService.uploadFile(
        file
      ).catch(console.error);

      const { transcription } = await replicate.run(
        process.env.OPENAI_WHISPER_VERSION,
        {
          input: {
            audio: uploadedObject.mediaLink,
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
    } catch (error) {
      return console.error(error);
    }
  },

  translateSubtitles: async (subtitles, language = "English") => {
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

  saveSubtitles: async (subtitles, name) => {
    const filename = name
      .split(".")
      .slice(0, -1)
      .join(".")
      .split(" ")
      .join("-")
      .concat(".srt");
    const location = path.join("public", filename);
    await fs.promises.writeFile(location, subtitles);
    return filename;
  },
};

module.exports = VideoService;
