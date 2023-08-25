const express = require("express");
const restricted = require("../middleware/restricted");
const AdminService = require("../service/AdminService");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { LogColor, LogType } = require("../utils/constants");
const { successResponse } = require("../domain/Response");

router.get("/settings", async (_, res) => {
  const settings = await AdminService.getSettings();
  return res.send(settings);
});

router.get("/logs", restricted(), async (req, res) => {
  try {
    const logFile = path.join(
      ".",
      "log",
      `${process.env.npm_package_name}.log`
    );
    const { limit, type } = req.query;
    const logs = await fs.promises.readFile(logFile, "utf-8");

    const getType = (message) => {
      const [_, type] = /\[([^[]+)\]/.exec(message) || [];
      return type ? LogType[type.toUpperCase()] : LogType.UNKNOWN;
    };

    const createMessage = (message) => {
      const type = getType(message);
      return {
        color: LogColor[type] || LogColor.INFO,
        content: message,
        type,
      };
    };

    const messages = logs
      .split("\n")
      .filter((message) => !type || type === "ALL" || type === getType(message))
      .slice(-limit)
      .map(createMessage);

    return res.send(successResponse(messages));
  } catch (error) {
    return res.status(500).send(errorResponse("Error retrieving logs"));
  }
});

router.put("/settings", restricted(), async (req, res) => {
  const settings = await AdminService.saveSettings(req.body);
  return res.send(settings);
});

module.exports = router;
