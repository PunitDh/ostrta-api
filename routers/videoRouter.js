const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");
const fileUtils = require("../utils/fileUtils");
const { PROGRESS_UPDATE } = require("../domain/SocketEvent");

// router.post(
//   "/subtitles/translate",
//   fileUpload.single("file"),
//   async (req, res) => {
//     const io = req.app.get("io");
//     const socketMap = req.app.get("socketMap");
//     const filename = fileUtils.extractName(req.file.originalname);
//     sendProgressUpdate("Extracting audio...");
//     const audioFile = await videoService.extractAudio(req.file, filename);
//     sendProgressUpdate("Extracting subtitles...");
//     const subtitles = await videoService.extractSubtitles(audioFile);
//     sendProgressUpdate(`Translating subtitles into ${req.body.language}`);
//     const translation = await videoService.translateSubtitles(
//       subtitles,
//       req.body.language
//     );
//     sendProgressUpdate(`Generating subtitles file on server`);
//     const location = await videoService.saveSubtitles(translation, filename);
//     await videoService.cleanupTempDir();
//     sendProgressUpdate(`Complete!`);

//     function sendProgressUpdate(update) {
//       io.to(socketMap[req.body.sessionId]).emit(
//         PROGRESS_UPDATE.response,
//         update
//       );
//     }
//     return res.send({ translation, location });
//   }
// );

router.post(
  "/subtitles/translate",
  fileUpload.single("file"),
  async (req, res) => {
    const io = req.app.get("io");
    const socketMap = req.app.get("socketMap");

    let delay = 1000;

    timedUpdate("Extracting audio...");
    timedUpdate("Extracting subtitles...");
    timedUpdate(`Translating subtitles into ${req.body.language}`);
    timedUpdate(`Generating subtitles file on server`);
    timedUpdate(`Cleaning up temporary directory`);
    timedUpdate(`Complete!`);

    function timedUpdate(update) {
      setTimeout(() => sendProgressUpdate(update), delay);
      delay += 1000;
    }

    function sendProgressUpdate(update) {
      io.to(socketMap[req.body.sessionId]).emit(PROGRESS_UPDATE.response, update);
    }

    setTimeout(() => {
      return res.send({ translation: "fake data", location: "fake location" });
    }, delay + 1000);
  }
);

module.exports = router;
