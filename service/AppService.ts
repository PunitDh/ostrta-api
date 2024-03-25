const fs = require("fs");
const { Time } = require("../utils/constants");
const LOGGER = require("../utils/logger");
const fileUtils = require("../utils/file");
const { getTimeDiff } = require("../utils/dateTimeUtils");

const AppService = {
  cleanupPublicDir: async () => {
    const files = await fileUtils.getFiles("./public");
    LOGGER.info(
      `Running cleanup of public files: ${files.length} file(s) found`
    );
    for (const file of files) {
      const fileLocation = `./public/${file}`;
      const { birthtime } = fs.statSync(fileLocation);
      const timeDiff = getTimeDiff(Date.now(), birthtime);
      LOGGER.info(
        `'${file}' is ${timeDiff.hours} hours ${timeDiff.minutes} mins old`
      );
      if (timeDiff.hours >= 24) {
        await fs.promises.rm(fileLocation);
        LOGGER.info(`Cleaned ${fileLocation}`);
      }
    }
    return true;
  },
};

export default AppService;
