require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("./db");
const { corsOptions, Time } = require("./utils/constants");
const videoRouter = require("./routers/videoRouter");
const playerRouter = require("./routers/playerRouter");
const gamesRouter = require("./routers/gamesRouter");
const adminRouter = require("./routers/adminRouter");
const socketHandlers = require("./handlers/socket");
const AppService = require("./service/AppService");
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

setInterval(async () => {
  await AppService.cleanupPublicDir();
}, Time.ONE_HOUR);

mongoose.connectToDB();
socketHandlers(io, app);
app.set("io", io);
app.use("/player", playerRouter);
app.use("/video", videoRouter);
app.use("/games", gamesRouter);
app.use("/admin", adminRouter);

http.listen(port, () => console.log("Server started on port", port));
