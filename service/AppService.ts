const fs = require("fs");
import LOGGER from "../utils/logger";
import fileUtils from "../utils/file";
import { getTimeDiff } from "../utils/dateTimeUtils";

const AppService = {
  cleanupPublicDir: async () => {
    const publicDir = "public";
    const files = await fileUtils.getFiles(`./${publicDir}`);
    LOGGER.info(
      `Running cleanup of public files: ${files.length} file(s) found`
    );
    for (const file of files) {
      const fileLocation = `./${publicDir}/${file}`;
      const { birthtime } = fs.statSync(fileLocation);
      const timeDiff = getTimeDiff(Date.now(), birthtime);
      LOGGER.info(
        `'${file}' is ${timeDiff.hours} hours ${timeDiff.minutes} mins old`
      );
      if (timeDiff.hours >= 24) {
        const size = fileUtils.getFileSizeString(fileLocation);
        await fs.promises.rm(fileLocation);
        LOGGER.info(`Cleaned ${fileLocation} (${size}`);
      }
    }
    return true;
  },
};

export default AppService;
