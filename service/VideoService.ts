import fs from "fs";
import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fileUtils from "../utils/file";
import HttpOpenAIDAO from "../dao/http/HttpOpenAIDAO";
import { SubtitleFormat } from "./types";

const VideoService = {
  extractAudio: async (
    file: Express.Multer.File,
    filename: string,
    sendProgressUpdate: (update: string) => void
  ): Promise<string> => {
    const videoFileName = `./temp/${file.originalname}`;
    await fs.promises.writeFile(videoFileName, file.buffer);

    sendProgressUpdate("Extracting audio...");
    const audioFileName = `./temp/${filename}.mp3`;
    ffmpeg.setFfmpegPath(ffmpegStatic!);

    return new Promise((resolve, reject) =>
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
        .on("error", (error) => reject(error))
    );
  },

  extractSubtitles: async (
    filename: string,
    transcriptionFormat: SubtitleFormat
  ): Promise<string> => {
    return await HttpOpenAIDAO.transcribe(filename, transcriptionFormat);
  },

  translateSubtitles: async (
    subtitles: string,
    format: SubtitleFormat,
    language = "English"
  ): Promise<string> => {
    if (!subtitles) return "No subtitles found";
    const prompt = `Can you translate these subtitles into ${language} while retaining all the timestamps? Just give me the output, no explanations. Please retain the timestamps in exactly the right places, that's really important! The output must follow the .${format} format. \n\n${subtitles}`;
    return await HttpOpenAIDAO.answer(prompt);
  },

  saveSubtitles: async (
    subtitles: string,
    filename: string,
    format: SubtitleFormat
  ): Promise<string> => {
    const fullFileName = filename.concat(`.${format}`);
    const location = path.join("public", fullFileName);
    await fs.promises.writeFile(location, subtitles, "utf-8");
    return fullFileName;
  },

  cleanupTempDir: async (): Promise<boolean> => {
    return await fileUtils.cleanUpDir("./temp");
  },
};

export default VideoService;
