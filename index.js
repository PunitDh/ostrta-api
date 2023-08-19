require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const mongoose = require("./db");
const { corsOptions } = require("./utils/constants");
const videoRouter = require("./routers/videoRouter");
const socketHandlers = require("./handlers/socket");
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use("/video", videoRouter);

mongoose.connectToDB();
socketHandlers(io);

http.listen(port, () => console.log("Server started on port", port));
