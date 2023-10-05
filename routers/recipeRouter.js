const express = require("express");
const secured = require("../middleware/secured");
const RecipeService = require("../service/RecipeService");
const { decodeJWT } = require("../utils/security");
const router = express.Router();

router.get("/settings", secured(), async (req, res) => {
  const decoded = decodeJWT(req.headers.authorization);
  const response = await RecipeService.getSettings(decoded.id);
  return res.status(response.code).send(response);
});

router.post("/settings", secured(), async (req, res) => {
  const decoded = decodeJWT(req.headers.authorization);
  const { dietaries, intolerances } = req.body;
  const response = await RecipeService.setSettings(
    decoded.id,
    dietaries,
    intolerances
  );
  return res.status(response.code).send(response);
});

module.exports = router;
