const express = require("express");
const secured = require("../middleware/secured");
const RestService = require("../service/RestService");
const router = express.Router();

router.post("/", secured(), async (req, res) => {
  const response = await RestService.sendRequest(req.body);
  return res.send(response);
});

module.exports = router;
