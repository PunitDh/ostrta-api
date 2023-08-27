const express = require("express");
const GameService = require("../service/GameService");
const secured = require("../middleware/secured");
const router = express.Router();

router.use(secured());

router.get("/recent", async (req, res) => {
  const { limit } = req.query;
  const games = await GameService.getRecentGames(limit);
  return res.status(games.status).send(games);
});

router.post("/new", async (req, res) => {
  const game = await GameService.createGame({
    _jwt: req.headers.authorization,
    opponent: req.body.opponent,
    icon: req.body.icon,
  });
  return res.status(game.status).send(game);
});

router.get("/:id", async (req, res) => {
  const game = await GameService.loadGame({ gameId: req.params.id });
  return res.status(game.status).send(game);
});

router.put("/:id", async (req, res) => {
  const game = await GameService.updateGame(req.params.id, req.body);
  return res.status(game.status).send(game);
});

router.delete("/:id", async (req, res) => {
  const game = await GameService.deleteGame({ gameId: req.params.id });
  return res.status(game.status).send(game);
});

module.exports = router;
