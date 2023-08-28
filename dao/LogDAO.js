const fs = require("fs");
const path = require("path");
const { LogType } = require("../utils/constants");

const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);

const getInfo = function (message) {
  const [type, time] = message.match(new RegExp(/(?<=\[).+?(?=\])/, "g")) || [];
  return { type: LogType[type], time };
};

const createMessages = function (logs, type, limit, time) {
  let id = 0;
  const createMessage = function (message) {
    const info = getInfo(message);
    if (!info.type) return;
    return {
      id: id++,
      content: message,
      type: info.type.toLowerCase(),
      time: new Date(info.time),
    };
  };

  const filterMessages = function (message) {
    return (
      message &&
      (!type || type === "ALL" || type === message.type) &&
      (Number(time) === 0 || message.time.getTime() > Date.now() - Number(time))
    );
  };

  return logs
    .split("\n")
    .map(createMessage)
    .filter(filterMessages)
    .slice(-limit);
};

const LogDAO = {
  retrieveLogs: async function (type, limit, time) {
    const logs = await fs.promises.readFile(logFile, "utf-8");
    return createMessages(logs, type, limit, time);
  },

  clearLogs: async function () {
    await fs.promises.writeFile(logFile, "", "utf-8");
    return LogDAO.retrieveLogs();
  },
};

module.exports = LogDAO;
