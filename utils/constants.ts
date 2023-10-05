export const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

export enum Time {
  ONE_SECOND = 1000,
  ONE_MINUTE = 1000 * 60,
  ONE_HOUR = 1000 * 3600,
  ONE_DAY = 1000 * 3600 * 24,
  ONE_WEEK = 1000 * 3600 * 24 * 7,
  ONE_MONTH = 1000 * 3600 * 24 * 30.4375,
  ONE_YEAR = 1000 * 3600 * 24 * 365,
}

export enum TerminalColor {
  RESET = "\x1b[0m",
  BRIGHT = "\x1b[1m",
  DIM = "\x1b[2m",
  UNDERSCORE = "\x1b[4m",
  BLINK = "\x1b[5m",
  REVERSE = "\x1b[7m",
  HIDDEN = "\x1b[8m",

  FG_BLACK = "\x1b[30m",
  FG_RED = "\x1b[31m",
  FG_GREEN = "\x1b[32m",
  FG_YELLOW = "\x1b[33m",
  FG_BLUE = "\x1b[34m",
  FG_MAGENTA = "\x1b[35m",
  FG_CYAN = "\x1b[36m",
  FG_WHITE = "\x1b[37m",
  FG_GRAY = "\x1b[90m",

  BG_BLACK = "\x1b[40m",
  BG_RED = "\x1b[41m",
  BG_GREEN = "\x1b[42m",
  BG_YELLOW = "\x1b[43m",
  BG_BLUE = "\x1b[44m",
  BG_MAGENTA = "\x1b[45m",
  BG_CYAN = "\x1b[46m",
  BG_WHITE = "\x1b[47m",
  BG_GRAY = "\x1b[100m",
}

export enum LogType {
  INFO = "INFO",
  WARN = "WARN",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  QUERY = "QUERY",
  TEST = "TEST",
  UNKNOWN = "UNKNOWN",
}

export enum LogTerminalColor {
  INFO = TerminalColor.FG_BLUE,
  WARN = TerminalColor.FG_YELLOW,
  SUCCESS = TerminalColor.FG_GREEN,
  ERROR = TerminalColor.FG_RED,
  QUERY = TerminalColor.FG_CYAN,
  TEST = "TEST",
}

export enum LogColor {
  INFO = "lightblue",
  WARN = "yellow",
  SUCCESS = "green",
  ERROR = "tomato",
  QUERY = "cyan",
  TEST = "TEST",
}
