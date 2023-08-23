const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);

function convertToMilliseconds(hrTime) {
  const [seconds, nanoseconds] = hrTime;
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  return Math.round(milliseconds * 100) / 100;
}

function convertToSeconds(hrTime) {
  return convertToMilliseconds(hrTime) / 1000;
}

module.exports = {
  formatDate,
  convertToMilliseconds,
  convertToSeconds,
};
