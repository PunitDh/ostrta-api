const router = require("express").Router();
const gptService = require("../service/GptService");
const { successResponse } = require("../domain/Response");

router.post("/reply", async (req, res) => {
  const startTime = process.hrtime();
  const response = await gptService.reply(req.body.content);
  return res.status(response.code).send(successResponse(response, startTime));
});

router.post("/translate", async (req, res) => {
  const startTime = process.hrtime();
  const response = await gptService.translate(
    req.body.content,
    req.body.language
  );

  return res.status(response.code).send(successResponse(response, startTime));
});

module.exports = router;
