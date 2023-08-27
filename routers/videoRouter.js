const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");
const fileUtils = require("../utils/file");
const { PROGRESS_UPDATE } = require("../domain/SocketEvent");
const LOGGER = require("../utils/logger");
const { convertToSeconds } = require("../utils");
const { successResponse, errorResponse } = require("../domain/Response");
const secured = require("../middleware/secured");

router.post(
  "/subtitles/translate",
  secured(),
  fileUpload.single("file"),
  async (req, res) => {
    if (req.body.debug) {
      if (!req.file || !req.file?.mimetype.includes("video")) {
        const response = errorResponse(
          "Invalid video file and/or no video file was found"
        );
        return res.status(response.code).send(response);
      }

      const io = req.app.get("io");
      const socketMap = req.app.get("socketMap");
      const startTime = process.hrtime();
      let delay = 1000;

      timedFunction(() => sendProgressUpdate("Extracting audio (Debug)..."));
      timedFunction(() =>
        sendProgressUpdate("Extracting subtitles (Debug)...")
      );
      timedFunction(() =>
        sendProgressUpdate(
          `Translating subtitles into ${req.body.language} (Debug)`
        )
      );
      timedFunction(() =>
        sendProgressUpdate(`Generating subtitles file on server (Debug)`)
      );
      timedFunction(() =>
        sendProgressUpdate(`Cleaning up temporary directory (Debug)`)
      );
      timedFunction(async () => await videoService.cleanupTempDir());
      timedFunction(() =>
        sendProgressUpdate(
          `Completed in ${convertToSeconds(process.hrtime(startTime)).toFixed(
            2
          )}s (Debug)!`
        )
      );

      function timedFunction(fn) {
        setTimeout(fn, delay);
        delay += 1000;
      }

      function sendProgressUpdate(update) {
        if (typeof socketMap === "object") {
          io.to(socketMap[req.body.sessionId]).emit(
            PROGRESS_UPDATE.response,
            update
          );
        }
      }

      setTimeout(() => {
        const response = successResponse(
          {
            translation: "fake data",
            location: "fake location",
            format: req.body.format,
          },
          startTime
        );
        return res.status(response.code).send(response);
      }, delay + 1000);
    } else {
      if (!req.file || !req.file?.mimetype.includes("video")) {
        const response = errorResponse(
          "Invalid video file and/or no video file was found"
        );
        return res.status(response.code).send(response);
      }
      const startTime = process.hrtime();
      const io = req.app.get("io");
      const socketMap = req.app.get("socketMap");
      const fileId = Math.random().toString(36).slice(2, 9);
      const { language, format } = req.body;
      const outputFilename = `${fileUtils.extractName(
        req.file.originalname
      )}-${fileId}`;
      sendProgressUpdate("Uploading file...");
      const audioFile = await videoService.extractAudio(
        req.file,
        outputFilename,
        sendProgressUpdate
      );
      sendProgressUpdate("Extracting subtitles...");
      const subtitles = await videoService.extractSubtitles(audioFile, format);
      sendProgressUpdate(`Translating subtitles into '${language}'`);
      const translation = await videoService.translateSubtitles(
        subtitles,
        format,
        language
      );
      sendProgressUpdate(`Generating subtitles file on server`);
      const location = await videoService.saveSubtitles(
        translation,
        outputFilename,
        format
      );
      await videoService.cleanupTempDir();
      const endTime = convertToSeconds(process.hrtime(startTime)).toFixed(2);
      sendProgressUpdate(`Completed in ${endTime}s`);

      function sendProgressUpdate(update) {
        LOGGER.info(update);
        if (socketMap) {
          io.to(socketMap[req.body.sessionId]).emit(
            PROGRESS_UPDATE.response,
            update
          );
        }
      }
      const response = successResponse(
        { translation, location, format },
        startTime
      );
      return res.status(response.code).send(response);
    }
  }
);

module.exports = router;
