const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");

router.post("/", fileUpload.single("file"), async (req, res) => {
  const subtitles = await videoService.extractSubtitles(req.file);
  const translation = await videoService.translateSubtitles(
    subtitles,
    req.body.language
  );
  const savedFile = await videoService.saveSubtitles(
    translation,
    req.file.originalname
  );
  return res.send({ translation, savedFile });
});

module.exports = router;
