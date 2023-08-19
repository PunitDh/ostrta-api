const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");
const fileUtils = require("../utils/fileUtils");

router.post("/", fileUpload.single("file"), async (req, res) => {
  const filename = fileUtils.extractName(req.file.originalname);
  const audioFile = await videoService.extractAudio(req.file, filename);
  const subtitles = await videoService.extractSubtitles(audioFile);
  const translation = await videoService.translateSubtitles(
    subtitles,
    req.body.language
  );
  const location = await videoService.saveSubtitles(translation, filename);
  await videoService.cleanupTempDir();
  return res.send({ translation, location });
});

module.exports = router;
