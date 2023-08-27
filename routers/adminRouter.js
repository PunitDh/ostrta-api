const express = require("express");
const restricted = require("../middleware/restricted");
const AdminService = require("../service/AdminService");
const router = express.Router();

router.get("/settings", async (_, res) => {
  const settings = await AdminService.getSettings();
  return res.status(200).send(settings);
});

router.get("/logs", restricted(), async (req, res) => {
  const { limit, type } = req.query;
  const logMessages = await AdminService.getLogs(limit, type);
  return res.status(200).send(logMessages);
});

router.delete("/logs", restricted(), async (_, res) => {
  const logMessages = await AdminService.clearLogs();
  return res.status(200).send(logMessages);
});

router.put("/settings", restricted(), async (req, res) => {
  const settings = await AdminService.saveSettings(req.body);
  return res.status(200).send(settings);
});

module.exports = router;
