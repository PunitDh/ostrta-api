const fs = require("fs");
const path = require("path");
const { LogType } = require("../utils/constants");

const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);

const getInfo = function (message) {
  if (!message) return;
  const [type, time] = message.match(new RegExp(/(?<=\[).+?(?=\])/, "g")) || [];
  const [content] = message.match(new RegExp(/(?<=((^\[).+\]: )).+/));
  return { type: LogType[type], time, content };
};

const createMessages = function (logs, type, limit, time) {
  const createMessage = function (message, id) {
    const info = getInfo(message);
    if (!info) return;
    return {
      id,
      content: info.content,
      type: info.type.toLowerCase(),
      time: new Date(info.time),
    };
  };

  const filterMessages = function (message) {
    return (
      message &&
      (!type ||
        type === "ALL" ||
        type.toLowerCase() === message.type.toLowerCase()) &&
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
