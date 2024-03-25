import express, { Request, Response } from "express";
const router = express.Router();
import multer from "multer";
const fileUpload = multer();
import videoService from "../service/VideoService";
import fileUtils from "../utils/file";
import SocketEvent from "../domain/SocketEvent";
import LOGGER from "../utils/logger";
import { convertToSeconds } from "../utils/dateTimeUtils";
import { successResponse, notFoundResponse } from "../domain/APIResponse";
import secured from "../middleware/secured";
import { BackgroundTasks } from "./types";

// router.get('/subtitles/sse', secured(), (req,res) => {
//   console.log('Client connected');
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   const intervalId = setInterval(() => {
//     const date = new Date().toLocaleDateString();
//     res.write(`data: ${date}`);

//   }, 1000);

//   res.on('close', () => {
//     console.log('Client closed connection');
//     clearInterval(intervalId);
//     res.end();
//   })
// })

const tasks: BackgroundTasks = {};

router.post(
  "/subtitles/translate",
  secured(),
  fileUpload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file || !req.file?.mimetype.includes("video")) {
      return res.status(400).send("A video file is required");
    }

    const id = Math.random().toString(36).slice(2, 9);

    tasks[id] = {
      id,
      status: "Pending",
    };

    startVideoProcessing(req, res, id);
    return res.status(200).send(tasks[id]);
  }
);

router.get("/task-status/:taskId", async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = tasks[taskId];
  if (task) {
    res.send(successResponse(task));
  } else {
    res
      .status(404)
      .send(notFoundResponse(`Task with id '${taskId}' not found`));
  }
});

async function startVideoProcessing(req: Request, res: Response, id: string) {
  const startTime = process.hrtime();
  const io = req.app.get("io");
  const socketMap = req.app.get("socketMap");

  function sendProgressUpdate(update: string) {
    if (typeof socketMap === "object") {
      LOGGER.info(update);
      io.to(socketMap[req.body.sessionId]).emit(
        SocketEvent.PROGRESS_UPDATE.response,
        update
      );
    }
  }

  if (req.body.debug) {
    let delay = 1000;

    function timedFunction(fn) {
      setTimeout(fn, delay);
      delay += 1000;
    }

    timedFunction(() => sendProgressUpdate("Extracting audio (Debug)..."));
    timedFunction(() => sendProgressUpdate("Extracting subtitles (Debug)..."));
    timedFunction(() =>
      sendProgressUpdate(
        `Translating subtitles into ${req.body.language} (Debug)`
      )
    );
    timedFunction(() =>
      sendProgressUpdate(`Generating subtitles file on server (Debug)`)
    );
    timedFunction(() =>
      sendProgressUpdate(`Cleaning up temporary directory (Debug)`)
    );
    timedFunction(async () => await videoService.cleanupTempDir());
    timedFunction(() =>
      sendProgressUpdate(
        `Completed in ${convertToSeconds(process.hrtime(startTime)).toFixed(
          2
        )}s (Debug)!`
      )
    );
    timedFunction(() => {
      const response = successResponse(
        {
          translation: "fake data",
          location: "fake location",
          format: req.body.format,
        },
        startTime
      );
      return res.status(response.code).send(response);
    });
  } else {
    const { language, format } = req.body;
    const filename = fileUtils.extractName(req.file!.originalname);
    const outputFilename = `${filename}-${id}`;

    sendProgressUpdate("Uploading file...");
    const audioFile = await videoService.extractAudio(
      req.file,
      outputFilename,
      sendProgressUpdate
    );

    sendProgressUpdate("Extracting subtitles...");
    const subtitles = await videoService.extractSubtitles(audioFile, format);

    sendProgressUpdate(`Translating subtitles into '${language}'`);
    const translation = await videoService.translateSubtitles(
      subtitles,
      format,
      language
    );

    sendProgressUpdate(`Generating subtitles file on server`);
    const location = await videoService.saveSubtitles(
      translation,
      outputFilename,
      format
    );

    await videoService.cleanupTempDir();
    const endTime = convertToSeconds(process.hrtime(startTime)).toFixed(2);

    sendProgressUpdate(`Completed in ${endTime}s`);
    const response = successResponse(
      { translation, location, format },
      startTime
    );
    return res.status(response.code).send(response);
  }
}

export default router;
