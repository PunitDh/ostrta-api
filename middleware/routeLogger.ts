import { NextFunction, Request, Response } from "express";
import { formatDate, convertToMilliseconds } from "../utils/dateTimeUtils";
import LOGGER from "../utils/logger";

export default function routeLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const date = formatDate(new Date());
    const url = `"${req.url}"`;
    LOGGER.info("Started", req.method, url, "at", date);

    res.on("finish", () => {
      const endTime = process.hrtime(startTime);
      const diffTime = convertToMilliseconds(endTime);
      LOGGER.info(
        "Completed",
        req.method,
        url,
        res.statusCode,
        res.statusMessage,
        "in",
        diffTime,
        "ms"
      );
    });

    next();
  };
}
