import { Request, Response } from "express";
import gptService from "../service/GptService";
import { successResponse } from "../domain/APIResponse";

const gptRouter = require("express").Router();

gptRouter.post("/reply", async (req: Request, res: Response) => {
  const startTime = process.hrtime();
  const response = await gptService.reply(req.body.content);
  return res.status(response.code).send(successResponse(response, startTime));
});

gptRouter.post("/translate", async (req: Request, res: Response) => {
  const startTime = process.hrtime();
  const response = await gptService.translate(
    req.body.content,
    req.body.language
  );

  return res.status(response.code).send(successResponse(response, startTime));
});

export default gptRouter;
