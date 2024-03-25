import { NextFunction, Request, Response } from "express";

function updateStatus() {
  return (req: Request, res: Response, next: NextFunction) => {
    const io = req.app.get("io");
    io.emit("online-status-changed");

    next();
  };
}

module.exports = updateStatus;
