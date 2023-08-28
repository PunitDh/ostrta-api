const fs = require("fs");
const { Time } = require("../utils/constants");
const LOGGER = require("../utils/logger");
const fileUtils = require("../utils/file");

const AppService = {
  cleanupPublicDir: async () => {
    const files = await fileUtils.getFiles("./public");
    LOGGER.info("Running cleanup of public files");
    for (const file of files) {
      const fileLocation = `./public/${file}`;
      const { birthtime } = fs.statSync(fileLocation);
      if (Date.now() - birthtime.getTime() > Time.ONE_DAY) {
        await fs.promises.rm(fileLocation);
        LOGGER.info(`Cleaned ${fileLocation}`);
      }
    }
    return true;
  },
};

module.exports = AppService;
