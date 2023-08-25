const fs = require("fs");
const path = require("path");
const { LogType } = require("../utils/constants");

const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);

const getType = function (message) {
  const [_, type] = /\[([^[]+)\]/.exec(message) || [];
  return type ? LogType[type] : LogType.UNKNOWN;
};

const createMessages = function (logs, type, limit) {
  const createMessage = function (message) {
    const type = getType(message);
    return {
      content: message,
      type: type.toLowerCase(),
    };
  };

  return logs
    .split("\n")
    .filter((message) => !type || type === "ALL" || type === getType(message))
    .slice(-limit)
    .map(createMessage)
    .filter((message) => message.type !== LogType.UNKNOWN.toLowerCase());
};

const LogDAO = {
  retrieveLogs: async function (type = "ALL", limit = 1) {
    const logs = await fs.promises.readFile(logFile, "utf-8");
    return createMessages(logs, type, limit);
  },

  clearLogs: async function () {
    await fs.promises.writeFile(logFile, "", "utf-8");
    return LogDAO.retrieveLogs();
  },
};

module.exports = LogDAO;
