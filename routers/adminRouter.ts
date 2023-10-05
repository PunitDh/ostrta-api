import { Request, Response } from "express";
import express from "express";
import restricted from "../middleware/restricted";
import AdminService from "../service/AdminService";

const router = express.Router();

router.get("/settings", async (_: Request, res: Response) => {
  const response = await AdminService.getSettings();
  res.cookie("name", "geeksforgeeks");
  return res.status(response.code).send(response);
});

router.get("/logs", restricted(), async (req: Request, res: Response) => {
  const { limit, type, time } = req.query;
  const response = await AdminService.getLogs(limit, type, time);
  return res.status(response.code).send(response);
});

router.delete("/logs", restricted(), async (_: Request, res: Response) => {
  const response = await AdminService.clearLogs();
  return res.status(response.code).send(response);
});

router.put("/settings", restricted(), async (req: Request, res: Response) => {
  const response = await AdminService.saveSettings(req.body);
  return res.status(response.code).send(response);
});

export default router;
