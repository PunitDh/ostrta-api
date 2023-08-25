const router = require("express").Router();
const gptService = require("../service/GptService");
const { successResponse } = require("../domain/Response");

router.post("/reply", async (req, res) => {
  const startTime = process.hrtime();
  const reply = await gptService.reply(req.body.content);
  return res.send(successResponse(reply, startTime));
});

router.post("/translate", async (req, res) => {
  const startTime = process.hrtime();
  const translation = await gptService.translate(
    req.body.content,
    req.body.language
  );

  return res.send(successResponse(translation, startTime));
});

module.exports = router;
