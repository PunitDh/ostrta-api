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

router.get("/logs", restricted(), async (req, res) => {
  const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);
  const { limit, type } = req.query;
  const logs = await fs.promises.readFile(logFile, "utf-8");

  const getType = (message) => {
    const bracketOpenIndex = message.indexOf("[");
    const bracketCloseIndex = message.indexOf("]");
    return message.slice(bracketOpenIndex + 1, bracketCloseIndex).toUpperCase();
  };

  const createMessage = (message) => {
    const type = getType(message);
    return {
      color: LogColor[type],
      content: message,
      type,
    };
  };

  const messages = logs
    .split("\n")
    .filter((message) => type === "ALL" || type === getType(message))
    .slice(-limit)
    .map(createMessage);

  return res.send(successResponse(messages));
});

router.put("/settings", restricted(), async (req, res) => {
  const settings = await AdminService.saveSettings(req.body);
  return res.send(settings);
});

module.exports = router;
