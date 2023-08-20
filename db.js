const mongoose = require("mongoose");
const LOGGER = require("./utils/logger");

const connectToDB = () =>
  mongoose
    .connect(process.env.MONGODB_URL)
    .then((response) =>
      LOGGER.info(
        "Successfully connected to MongoDB cluster:",
        `'${response.connections[0].name}'`
      )
    )
    .catch((error) => LOGGER.error("Failed to connect to MongoDB", error));

module.exports = { connectToDB };
