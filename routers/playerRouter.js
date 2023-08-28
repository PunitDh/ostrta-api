const express = require("express");
const PlayerService = require("../service/PlayerService");
const secured = require("../middleware/secured");
const ConversationService = require("../service/ConversationService");
const router = express.Router();

router.post("/register", async (req, res) => {
  const response = await PlayerService.registerPlayer(req.body);
  return res.status(response.code).send(response);
});

router.post("/login", async (req, res) => {
  const response = await PlayerService.loginPlayer(req.body);
  return res.status(response.code).send(response);
});

router.get("/games", secured(), async (req, res) => {
  const response = await PlayerService.getCurrentGames({
    _jwt: req.headers.authorization,
  });
  return res.status(response.code).send(response);
});

router.get("/chats", secured(), async (req, res) => {
  const response = await ConversationService.getConversations({
    _jwt: req.headers.authorization,
  });
  return res.status(response.code).send(response);
});

router.get("/players", secured(), async (req, res) => {
  const response = await PlayerService.getOnlineUsers({
    _jwt: req.headers.authorization,
  });
  const io = req.app.get("io");
  io.emit("users-changed");
  return res.status(response.code).send(response);
});

router.put("/", secured(), async (req, res) => {
  const response = await PlayerService.updateProfile({
    _jwt: req.headers.authorization,
    ...req.body,
  });
  return res.status(response.code).send(response);
});

router.delete("/", secured(), async (req, res) => {
  const response = await PlayerService.deleteProfile({
    password: req.body.password,
    _jwt: req.headers.authorization,
  });
  return res.status(response.code).send(response);
});

module.exports = router;
