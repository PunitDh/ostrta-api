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
const aiRouter = require("./routers/aiRouter");
const socketHandlers = require("./handlers/SocketHandler");
const AppService = require("./service/AppService");
const routeLogger = require("./middleware/routeLogger");
const LOGGER = require("./utils/logger");
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

app.use(routeLogger());

app.use("/admin", adminRouter);
app.use("/ai", aiRouter);
app.use("/games", gamesRouter);
app.use("/player", playerRouter);
app.use("/video", videoRouter);

http.listen(port, () => LOGGER.info("Server started on port", port));
