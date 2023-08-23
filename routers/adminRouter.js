const express = require("express");
const restricted = require("../middleware/restricted");
const AdminService = require("../service/AdminService");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { LogColor } = require("../utils/constants");
const { successResponse } = require("../domain/Response");

router.get("/settings", async (_, res) => {
  const settings = await AdminService.getSettings();
  return res.send(settings);
});

router.get("/logs", restricted(), async (_, res) => {
  const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);
  const logs = await fs.promises.readFile(logFile, "utf-8");
  const getMessageColour = (message) => {
    const bracketOpenIndex = message.indexOf("[");
    const bracketCloseIndex = message.indexOf("]");
    const type = message.slice(bracketOpenIndex + 1, bracketCloseIndex);
    return LogColor[type];
  };

  const messages = logs
    .split("\n")
    .slice(-50)
    .map((message) => ({ color: getMessageColour(message), content: message }));

  return res.send(successResponse(messages));
});

router.put("/settings", restricted(), async (req, res) => {
  const settings = await AdminService.saveSettings(req.body);
  return res.send(settings);
});

module.exports = router;
