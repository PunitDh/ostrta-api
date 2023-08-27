const express = require("express");
const GameService = require("../service/GameService");
const secured = require("../middleware/secured");
const router = express.Router();

router.use(secured());

router.get("/recent", async (req, res) => {
  const { limit } = req.query;
  const response = await GameService.getRecentGames(limit);
  return res.status(response.code).send(response);
});

router.post("/new", async (req, res) => {
  const response = await GameService.createGame({
    _jwt: req.headers.authorization,
    opponent: req.body.opponent,
    icon: req.body.icon,
  });
  return res.status(response.code).send(response);
});

router.get("/:id", async (req, res) => {
  const response = await GameService.loadGame({ gameId: req.params.id });
  return res.status(response.code).send(response);
});

router.put("/:id", async (req, res) => {
  const response = await GameService.updateGame(req.params.id, req.body);
  return res.status(response.code).send(response);
});

router.delete("/:id", async (req, res) => {
  const response = await GameService.deleteGame({ gameId: req.params.id });
  return res.status(response.code).send(response);
});

module.exports = router;
