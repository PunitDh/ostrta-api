import express, { Request, Response } from "express";
import PlayerService from "../service/PlayerService";
import secured from "../middleware/secured";
import ConversationService from "../service/ConversationService";
const playerRouter = express.Router();

playerRouter.post("/register", async (req: Request, res: Response) => {
  const response = await PlayerService.registerPlayer(req.body);
  return res.status(response.code).send(response);
});

playerRouter.post("/login", async (req: Request, res: Response) => {
  const response = await PlayerService.loginPlayer(
    req.headers.authorization!,
    req.body.remember
  );
  return res.status(response.code).send(response);
});

playerRouter.get("/games", secured(), async (req: Request, res: Response) => {
  const response = await PlayerService.getCurrentGames({
    _jwt: req.headers.authorization!,
  });
  return res.status(response.code).send(response);
});

playerRouter.get("/chats", secured(), async (req: Request, res: Response) => {
  const response = await ConversationService.getConversations({
    _jwt: req.headers.authorization!,
  });
  return res.status(response.code).send(response);
});

playerRouter.get("/players", secured(), async (req: Request, res: Response) => {
  const response = await PlayerService.getOnlineUsers({
    _jwt: req.headers.authorization!,
  });
  const io = req.app.get("io");
  io.emit("users-changed");
  return res.status(response.code).send(response);
});

playerRouter.put("/", secured(), async (req: Request, res: Response) => {
  const response = await PlayerService.updateProfile({
    _jwt: req.headers.authorization,
    ...req.body,
  });
  return res.status(response.code).send(response);
});

playerRouter.delete("/", secured(), async (req: Request, res: Response) => {
  const response = await PlayerService.deleteProfile({
    password: req.body.password,
    _jwt: req.headers.authorization!,
  });
  return res.status(response.code).send(response);
});

export default playerRouter;
