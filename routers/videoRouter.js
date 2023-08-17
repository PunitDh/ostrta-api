const router = require("express").Router();
const multer = require("multer");
const fileUpload = multer();
const videoService = require("../service/VideoService");

router.post("/", fileUpload.single("file"), (req, res) => {
  const { file } = req;
  console.log(file);
  videoService.extractAudio(file);
  return res.send("Video router");
});

module.exports = router;
