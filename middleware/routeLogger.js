const { formatDate, convertToMilliseconds } = require("../utils");
const LOGGER = require("../utils/logger");

function routeLogger() {
  return (req, res, next) => {
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

module.exports = routeLogger;
