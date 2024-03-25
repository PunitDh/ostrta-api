import express, { Request, Response } from "express";
import restricted from "../middleware/restricted";
import AdminService from "../service/AdminService";

const adminRouter = express.Router();

adminRouter.get("/settings", async (_: Request, res: Response) => {
  const response = await AdminService.getSettings();
  res.cookie("name", "geeksforgeeks");
  return res.status(response.code).send(response);
});

adminRouter.get("/logs", restricted(), async (req: Request, res: Response) => {
  const { limit, type, time } = req.query;
  const response = await AdminService.getLogs(
    Number(limit),
    String(type),
    String(time)
  );
  return res.status(response.code).send(response);
});

adminRouter.delete("/logs", restricted(), async (_: Request, res: Response) => {
  const response = await AdminService.clearLogs();
  return res.status(response.code).send(response);
});

adminRouter.put(
  "/settings",
  restricted(),
  async (req: Request, res: Response) => {
    const response = await AdminService.saveSettings(req.body);
    return res.status(response.code).send(response);
  }
);

export default adminRouter;
