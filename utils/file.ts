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
      await fs.promises.rm(`${folder}/${file}`);
      LOGGER.info(`Cleaned ${folder}/${file}`);
    }
    return true;
  },
};

export default FileUtils;
