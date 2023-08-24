const router = require("express").Router();
const gptService = require("../service/GptService");
const { convertToMilliseconds } = require("../utils");
const { successResponse } = require("../domain/Response");

router.post("/reply", async (req, res) => {
  const startTime = process.hrtime();
  const reply = await gptService.reply(req.body.content);
  const processTimeMs = convertToMilliseconds(process.hrtime(startTime));
  return res.send(successResponse({ reply, processTimeMs }));
});

router.post("/translate", async (req, res) => {
  const startTime = process.hrtime();
  const translation = await gptService.translate(
    req.body.content,
    req.body.language
  );

  const processTimeMs = convertToMilliseconds(process.hrtime(startTime));
  return res.send(successResponse({ translation, processTimeMs }));
});

module.exports = router;
