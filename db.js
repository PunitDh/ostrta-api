const mongoose = require("mongoose");

const connectToDB = () =>
  mongoose
    .connect(process.env.MONGODB_URL)
    .then((response) =>
      console.log(
        "Successfully connected to MongoDB cluster:",
        `'${response.connections[0].name}'`
      )
    )
    .catch((error) => console.error("Failed to connect to MongoDB", error));

module.exports = { connectToDB };
