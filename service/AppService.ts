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
      const { birthtime, size } = fs.statSync(fileLocation);
      const timeDiff = getTimeDiff(Date.now(), birthtime);
      LOGGER.info(
        `'${file}' is ${timeDiff.hours} hours ${timeDiff.minutes} mins old`
      );
      if (timeDiff.hours >= 24) {
        await fs.promises.rm(fileLocation);
        const sizeKB = size / 1024;
        const sizeMB = sizeKB / 1024;
        const sizeDisplay =
          sizeMB < 1 ? `${sizeKB.toFixed(2)}KB` : `${sizeMB.toFixed(2)}MB`;
        LOGGER.info(`Cleaned ${fileLocation} (${sizeDisplay}`);
      }
    }
    return true;
  },
};

export default AppService;
