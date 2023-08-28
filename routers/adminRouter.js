const express = require("express");
const restricted = require("../middleware/restricted");
const AdminService = require("../service/AdminService");
const router = express.Router();

router.get("/settings", async (_, res) => {
  const response = await AdminService.getSettings();
  return res.status(response.code).send(response);
});

router.get("/logs", restricted(), async (req, res) => {
  const { limit, type, time } = req.query;
  const response = await AdminService.getLogs(limit, type, time);
  return res.status(response.code).send(response);
});

router.delete("/logs", restricted(), async (_, res) => {
  const response = await AdminService.clearLogs();
  return res.status(response.code).send(response);
});

router.put("/settings", restricted(), async (req, res) => {
  const response = await AdminService.saveSettings(req.body);
  return res.status(response.code).send(response);
});

module.exports = router;
