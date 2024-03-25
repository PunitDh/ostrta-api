import express, { Request, Response } from "express";
import secured from "../middleware/secured";
import RestService from "../service/RestService";
const restRouter = express.Router();

restRouter.post("/", secured(), async (req: Request, res: Response) => {
  const response = await RestService.sendRequest(req.body);
  return res.send(response);
});

module.exports = restRouter;
