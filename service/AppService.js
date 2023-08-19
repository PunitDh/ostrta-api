const fs = require("fs");
const { Time } = require("../utils/constants");

const AppService = {
  cleanupPublicDir: async () => {
    const files = (await fs.promises.readdir("./public")).filter(
      (file) => file !== ".keep"
    );
    for (const file of files) {
      const { birthtime } = fs.statSync(`./public/${file}`);
      if (new Date().getTime() - birthtime.getTime() > Time.ONE_DAY) {
        await fs.promises.rm(`./public/${file}`);
        console.log(`Cleaned ./public/${file}`);
      }
    }
    return true;
  },
};

module.exports = AppService;
