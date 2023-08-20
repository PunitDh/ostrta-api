const express = require("express");
const GameService = require("../service/GameService");
const secured = require("../middleware/secured");
const router = express.Router();

router.use(secured());

router.get("/recent", async (_, res) => {
  const games = await GameService.getRecentGames();
  return res.send(games);
});

router.post("/new", async (req, res) => {
  const game = await GameService.createGame(req.body);
  return res.send(game);
});

router.get("/:id", async (req, res) => {
  const game = await GameService.loadGame({ gameId: req.params.id });
  return res.send(game);
});

router.put("/:id", async (req, res) => {
  const game = await GameService.updateGame(req.params.id, req.body);
  return res.send(game);
});

router.delete("/:id", async (req, res) => {
  const game = await GameService.deleteGame({ gameId: req.params.id });
  return res.send(game);
});

module.exports = router;
