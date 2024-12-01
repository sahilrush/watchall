import { Router } from "express";
import { getVideoDetails, timeStampUpdate, uploadVideo, videoFeed } from "../actions/video";


export const videoRouter = Router()

videoRouter.get("/feed", videoFeed)
videoRouter.post("/upload", uploadVideo)
videoRouter.get("/:video_id", getVideoDetails)
videoRouter.put("/:video_id/time", timeStampUpdate)