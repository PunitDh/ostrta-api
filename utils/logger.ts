import fs from "fs";
import path from "path";
import { LogType, LogTerminalColor } from "./constants";
import { formatDate } from "./dateTimeUtils";

function logMessage(type: string, color: string, ...messageFrags: any[]) {
  const parsedMessages = messageFrags.map((frag) =>
    typeof frag === "object" ? JSON.stringify(frag) : frag
  );
  const message = [
    `[${type}]`,
    `[${formatDate(new Date())}]:`,
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
  info: function (...messages: any[]) {
    logMessage(LogType.INFO, LogTerminalColor.INFO, ...messages);
  },
  warn: function (...messages: any[]) {
    logMessage(LogType.WARN, LogTerminalColor.WARN, ...messages);
  },
  success: function (...messages: any[]) {
    logMessage(LogType.SUCCESS, LogTerminalColor.SUCCESS, ...messages);
  },
  error: function (...messages: any[]) {
    logMessage(LogType.ERROR, LogTerminalColor.ERROR, ...messages);
  },
  query: function (...messages: any[]) {
    logMessage(LogType.QUERY, LogTerminalColor.QUERY, ...messages);
  },
  custom: function (type: string, color: string, ...messages: any[]) {
    logMessage(
      type || LogType.INFO,
      color || LogTerminalColor.INFO,
      ...messages
    );
  },
};

export default LOGGER;
