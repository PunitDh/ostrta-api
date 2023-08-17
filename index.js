const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
require("dotenv").config();
const port = process.env.PORT || 3000;
const mongoose = require("./db");
const { corsOptions } = require("./utils/constants");
const videoRouter = require("./routers/videoRouter");
const socketHandlers = require("./handlers/socket");
const io = require("socket.io")(http);

app.use(cors(corsOptions));
app.use("/video", videoRouter);

mongoose.connectToDB();
socketHandlers(io);

http.listen(port, () => console.log("Server started on port", port));
