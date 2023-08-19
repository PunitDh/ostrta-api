const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const Time = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 1000 * 60,
  ONE_HOUR: 1000 * 3600,
  ONE_DAY: 1000 * 3600 * 24,
  ONE_WEEK: 1000 * 3600 * 24 * 7,
  ONE_MONTH: 1000 * 3600 * 24 * 30.4375,
  ONE_YEAR: 1000 * 3600 * 24 * 365,
};

module.exports = { corsOptions, Time };
