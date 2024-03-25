const fs = require("fs");
import LOGGER from "./logger";

const FileUtils = {
  extractName: function (originalname: string): string {
    return originalname.split(".").slice(0, -1).join(".").split(" ").join("-");
  },

  getFiles: async function (folder: string) {
    return (await fs.promises.readdir(folder)).filter(
      (file: string) => file !== ".keep"
    );
  },

  cleanUpDir: async function (folder: string): Promise<boolean> {
    const files = await this.getFiles(folder);
    for (const file of files) {
      const fileLocation = `${folder}/${file}`;
      const { size } = fs.statSync(fileLocation);
      const sizeKB = size / 1024;
      const sizeMB = sizeKB / 1024;
      const sizeDisplay =
        sizeMB < 1 ? `${sizeKB.toFixed(2)} KB` : `${sizeMB.toFixed(2)} MB`;
      await fs.promises.rm(fileLocation);
      LOGGER.info(`Cleaned ${folder}/${file} (${sizeDisplay})`);
    }
    return true;
  },
};

export default FileUtils;
