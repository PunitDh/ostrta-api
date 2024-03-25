import express from "express";
import GameService from "../service/GameService";
import secured from "../middleware/secured";
const gamesRouter = express.Router();

gamesRouter.use(secured());

gamesRouter.get("/recent", async (req, res) => {
  const { limit } = req.query;
  const response = await GameService.getRecentGames(limit);
  return res.status(response.code).send(response);
});

gamesRouter.post("/new", async (req, res) => {
  const response = await GameService.createGame({
    _jwt: req.headers.authorization!,
    opponent: req.body.opponent,
    icon: req.body.icon,
  });
  return res.status(response.code).send(response);
});

gamesRouter.get("/:id", async (req, res) => {
  const response = await GameService.loadGame({ gameId: req.params.id });
  return res.status(response.code).send(response);
});

gamesRouter.put("/:id", async (req, res) => {
  const response = await GameService.updateGame(req.params.id, req.body);
  return res.status(response.code).send(response);
});

gamesRouter.delete("/:id", async (req, res) => {
  const response = await GameService.deleteGame({ gameId: req.params.id });
  return res.status(response.code).send(response);
});

export default gamesRouter;
