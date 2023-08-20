const express = require("express");
const restricted = require("../middleware/restricted");
const AdminService = require("../service/AdminService");
const router = express.Router();

router.get("/settings", async (_, res) => {
  const settings = await AdminService.getSettings();
  return res.send(settings);
});

router.put("/settings", restricted(), async (req, res) => {
  const settings = await AdminService.saveSettings(req.body);
  return res.send(settings);
});

module.exports = router;
