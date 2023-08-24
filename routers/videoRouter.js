const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");
const fileUtils = require("../utils/file");
const { PROGRESS_UPDATE } = require("../domain/SocketEvent");
const LOGGER = require("../utils/logger");
const { convertToSeconds } = require("../utils");
const { successResponse } = require("../domain/Response");

router.post(
  "/subtitles/translate",
  fileUpload.single("file"),
  async (req, res) => {
    const startTime = process.hrtime();
    const io = req.app.get("io");
    const socketMap = req.app.get("socketMap");
    const fileId = Math.random().toString(36).slice(2, 9);
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
    const subtitles = await videoService.extractSubtitles(audioFile);
    sendProgressUpdate(`Translating subtitles into '${req.body.language}'`);
    const translation = await videoService.translateSubtitles(
      subtitles,
      req.body.language
    );
    sendProgressUpdate(`Generating subtitles file on server`);
    const location = await videoService.saveSubtitles(
      translation,
      outputFilename
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
    return res.send(successResponse({ translation, location }));
  }
);

// router.post(
//   "/subtitles/translate",
//   fileUpload.single("file"),
//   async (req, res) => {
//     const io = req.app.get("io");
//     const socketMap = req.app.get("socketMap");
//     const startTime = process.hrtime();
//     let delay = 1000;

//     timedFunction(() => sendProgressUpdate("Extracting audio..."));
//     timedFunction(() => sendProgressUpdate("Extracting subtitles..."));
//     timedFunction(() =>
//       sendProgressUpdate(`Translating subtitles into ${req.body.language}`)
//     );
//     timedFunction(() =>
//       sendProgressUpdate(`Generating subtitles file on server`)
//     );
//     timedFunction(() => sendProgressUpdate(`Cleaning up temporary directory`));
//     timedFunction(async () => await videoService.cleanupTempDir());
//     timedFunction(() =>
//       sendProgressUpdate(
//         `Completed in ${convertToSeconds(process.hrtime(startTime)).toFixed(
//           2
//         )}s!`
//       )
//     );

//     function timedFunction(fn) {
//       setTimeout(fn, delay);
//       delay += 1000;
//     }

//     function sendProgressUpdate(update) {
//       io.to(socketMap[req.body.sessionId]).emit(
//         PROGRESS_UPDATE.response,
//         update
//       );
//     }

//     setTimeout(() => {
//       return res.send(
//         successResponse({ translation: "fake data", location: "fake location" })
//       );
//     }, delay + 1000);
//   }
// );

module.exports = router;
