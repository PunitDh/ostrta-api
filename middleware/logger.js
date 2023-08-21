const { formatDate } = require("../utils");
const LOGGER = require("../utils/logger");

function convertToMilliseconds(seconds, nanoseconds) {
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  return Math.round(milliseconds * 100) / 100;
}

function routeLogger() {
  return (req, res, next) => {
    const startTime = process.hrtime();
    const date = formatDate(new Date());
    const url = `"${req.url}"`;
    LOGGER.info("Started", req.method, url, "at", date);
    res.on("finish", () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const diffTime = convertToMilliseconds(seconds, nanoseconds);
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

module.exports = routeLogger;
