const fs = require("fs");
const path = require("path");
const { LogType } = require("../utils/constants");

const logFile = path.join(".", "log", `${process.env.npm_package_name}.log`);

type LogMessage = {
  id: string;
  content: string;
  type: string;
  timeStamp: Date;
};

const getInfo = function (message: string) {
  if (!message) return;
  const [type, time] = message.match(new RegExp(/(?<=\[).+?(?=\])/, "g")) || [];
  const matches = message.match(new RegExp(/(?<=((^\[).+\]: )).+/));
  return { type: LogType[type!], time, content: matches![0] };
};

const createMessages = function (
  logs: string,
  type: string,
  limit: number,
  time: string
) {
  const createMessage = function (
    message: string,
    id: string
  ): LogMessage | undefined {
    const info = getInfo(message);
    if (!info) return;
    return {
      id,
      content: info.content,
      type: info.type.toLowerCase(),
      timeStamp: new Date(info.time),
    };
  };

  const filterMessages = function (logMessage: LogMessage) {
    return (
      logMessage &&
      (!type ||
        type === "ALL" ||
        type.toLowerCase() === logMessage.type.toLowerCase()) &&
      (Number(time) === 0 ||
        logMessage.timeStamp.getTime() > Date.now() - Number(time))
    );
  };

  return logs
    .split("\n")
    .map(createMessage as any)
    .filter(filterMessages as any)
    .slice(-limit);
};

const LogDAO = {
  retrieveLogs: async function (
    type: string = "ALL",
    limit: number,
    time: string
  ) {
    const logs = await fs.promises.readFile(logFile, "utf-8");
    return createMessages(logs, type, limit, time);
  },

  clearLogs: async function () {
    await fs.promises.writeFile(logFile, "", "utf-8");
    return LogDAO.retrieveLogs(undefined, 100, "");
  },
};

export default LogDAO;
