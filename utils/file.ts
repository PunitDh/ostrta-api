const fs = require("fs");
import LOGGER from "./logger";

const FileUtils = {
  byteSize: 1024,

  extractName: function (originalname: string): string {
    return originalname.split(".").slice(0, -1).join(".").split(" ").join("-");
  },

  getFiles: async function (folder: string): Promise<string[]> {
    return (await fs.promises.readdir(folder)).filter(
      (file: string) => file !== ".keep"
    );
  },

  getFileSizeString: function (file: string): string {
    const { size: sizeB } = fs.statSync(file);
    const sizeKB = sizeB / this.byteSize;
    const sizeMB = sizeKB / this.byteSize;
    return sizeMB < 1
      ? sizeKB < 1
        ? `${sizeB} B`
        : `${sizeKB.toFixed(2)} KB`
      : `${sizeMB.toFixed(2)} MB`;
  },

  cleanUpDir: async function (folder: string): Promise<boolean> {
    const files = await this.getFiles(folder);
    for (const file of files) {
      const fileLocation = `${folder}/${file}`;
      const size = this.getFileSizeString(fileLocation);
      await fs.promises.rm(fileLocation);
      LOGGER.info(`Cleaned ${folder}/${file} (${size})`);
    }
    return true;
  },
};

export default FileUtils;
