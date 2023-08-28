/**
 * Converts a given date to a (MMM DD, YYYY, HH:MM:SS AM/PM) format
 * @param {Date} date
 * @returns {String}
 */
const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);

/**
 * Converts a given HRTime to milliseconds
 * @param {HRTime} hrTime
 * @returns {Number}
 */
function convertToMilliseconds(hrTime) {
  const [seconds, nanoseconds] = hrTime;
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  return Math.round(milliseconds * 100) / 100;
}

/**
 * Converts a given HRTime to seconds
 * @param {HRTime} hrTime
 * @returns {Number}
 */
function convertToSeconds(hrTime) {
  return convertToMilliseconds(hrTime) / 1000;
}

/**
 *
 * @param {Number} time1
 * @param {Number} time2
 * @returns {{ hours: Number, minutes: Number, seconds: Number, milliseconds: Number }}
 */
function getTimeDiff(time1, time2) {
  const diffMs = new Date(time1).getTime() - new Date(time2).getTime();
  const hours = diffMs / (1000 * 3600);
  const minutes = (hours - Math.floor(hours)) * 60;
  const seconds = (minutes - Math.floor(minutes)) * 60;
  const milliseconds = (seconds - Math.floor(seconds)) * 1000;

  return {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
    seconds: Math.floor(seconds),
    milliseconds: Math.floor(milliseconds),
  };
}

module.exports = {
  formatDate,
  convertToMilliseconds,
  convertToSeconds,
  getTimeDiff,
};
