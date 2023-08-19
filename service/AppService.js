const fs = require("fs");
const { Time } = require("../utils/constants");

const AppService = {
  cleanupPublicDir: async () => {
    const files = (await fs.promises.readdir("./public")).filter(
      (file) => file !== ".keep"
    );
    for (const file of files) {
      const fileLocation = `./public/${file}`;
      const { birthtime } = fs.statSync(fileLocation);
      if (Date.now() - birthtime.getTime() > Time.ONE_DAY) {
        await fs.promises.rm(fileLocation);
        console.log(`Cleaned ${fileLocation}`);
      }
    }
    return true;
  },
};

module.exports = AppService;
