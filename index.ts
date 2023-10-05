import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

import dotenv from "dotenv";
import express from "express";
dotenv.config();
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
import bodyParser from "body-parser";
import cors from "cors";
import { connectToDatabase } from "./db";
import { corsOptions, Time } from "./utils/constants";
import videoRouter from "./routers/videoRouter";
import playerRouter from "./routers/playerRouter";
import gamesRouter from "./routers/gamesRouter";
import adminRouter from "./routers/adminRouter";
import gptRouter from "./routers/gptRouter";
import restRouter from "./routers/restRouter";
import socketHandlers from "./handlers/SocketHandler";
import AppService from "./service/AppService";
import routeLogger from "./middleware/routeLogger";
import LOGGER from "./utils/logger";
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
// app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

connectToDatabase();

socketHandlers(io, app);

app.set("io", io);

app.use(routeLogger());

setInterval(async () => {
  await AppService.cleanupPublicDir();
}, Time.ONE_HOUR);

app.use("/admin", adminRouter);
app.use("/games", gamesRouter);
app.use("/gpt", gptRouter);
app.use("/player", playerRouter);
app.use("/video", videoRouter);
app.use("/rest", restRouter);

http.listen(port, () => LOGGER.info("Server started on port", port));
