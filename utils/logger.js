const fs = require("fs");
const path = require("path");
const { LogType, LogTerminalColor } = require("./constants");

function logMessage(type, color, ...messageFrags) {
  const parsedMessages = messageFrags.map((frag) =>
    typeof frag === "object" ? JSON.stringify(frag) : frag
  );
  const message = [
    `[${type}]`,
    `[${new Date().toLocaleString()}]:`,
    ...parsedMessages,
  ].join(" ");

  switch (type) {
    case LogType.ERROR:
      console.error(`${color}%s\x1b[0m`, message);
      break;
    case LogType.WARN:
      console.warn(`${color}%s\x1b[0m`, message);
      break;
    default:
      console.log(`${color}%s\x1b[0m`, message);
      break;
  }

  const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);

  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "", "utf-8");
  } else {
    fs.appendFileSync(logFile, `${message}\n`, "utf-8");
  }
}

const LOGGER = {
  info: function () {
    logMessage(LogType.INFO, LogTerminalColor.INFO, ...arguments);
  },
  warn: function () {
    logMessage(LogType.WARN, LogTerminalColor.WARN, ...arguments);
  },
  success: function () {
    logMessage(LogType.SUCCESS, LogTerminalColor.SUCCESS, ...arguments);
  },
  error: function () {
    logMessage(LogType.ERROR, LogTerminalColor.ERROR, ...arguments);
  },
  query: function () {
    logMessage(LogType.QUERY, LogTerminalColor.QUERY, ...arguments);
  },
  custom: function () {
    logMessage(
      arguments[0] || LogType.INFO,
      arguments[1] || LogTerminalColor.INFO,
      [...arguments].slice(2)
    );
  },
};

module.exports = LOGGER;
