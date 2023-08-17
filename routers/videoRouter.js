const router = require("express").Router();

router.get("/", (req, res) => {
  return res.send("Video router");
});

module.exports = router;
