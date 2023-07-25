const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
require("dotenv").config();
const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === "production";
let io;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

if (isProduction) {
  io = require("socket.io")(http);
  console.log("Web socket server started in production");
} else {
  io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });
  console.log("Web socket server started locally");
}

io.on("connection", (socket) => {
  console.log("New connection started with socket ID: ", socket.id);

  socket.on("new-user", (name) => {
    console.log("User connected:", name);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

isProduction &&
  http.listen(port, () => console.log("Server started on port", port));
