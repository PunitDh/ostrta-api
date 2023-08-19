require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const mongoose = require("./db");
const { corsOptions, Time } = require("./utils/constants");
const videoRouter = require("./routers/videoRouter");
const socketHandlers = require("./handlers/socket");
const AppService = require("./service/AppService");
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use("/video", videoRouter);

setInterval(async () => {
  await AppService.cleanupPublicDir();
}, Time.ONE_HOUR);

mongoose.connectToDB();
socketHandlers(io);

http.listen(port, () => console.log("Server started on port", port));
