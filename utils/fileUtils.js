const fs = require("fs");
const LOGGER = require("./logger");

module.exports = {
  extractName: function (originalname) {
    return originalname.split(".").slice(0, -1).join(".").split(" ").join("-");
  },
  getFiles: async function (folder) {
    return (await fs.promises.readdir(folder)).filter(
      (file) => file !== ".keep"
    );
  },
  cleanUpDir: async function (folder) {
    const files = await this.getFiles(folder);
    for (const file of files) {
      await fs.promises.rm(`${folder}/${file}`);
      LOGGER.info(`Cleaned ${folder}/${file}`);
    }
    return true;
  },
};
