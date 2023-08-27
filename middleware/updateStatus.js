function updateStatus() {
  return (req, res, next) => {
    const io = req.app.get("io");
    io.emit("online-status-changed");

    next();
  };
}

module.exports = updateStatus;
