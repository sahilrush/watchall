import { ScanStream } from "ioredis"
import { GetVideoDetailSchema, UpdateTimestampSchema, UploadVideoSchema, VideoFeedQuerySchema, VideoInputSchema } from "../types.ts/index.js";
import { string } from "zod";
import { Request, Response } from "express";
import { PrismaClient, VideoCategory } from "@prisma/client";
import multer from 'multer';
import { v4 as uuidv4, validate } from "uuid";
import { JWT_PASSWORD } from "../config.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";

const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const updatePath = path.resolve(__dirname, "../uploads/videos");
        cb(null, updatePath)
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`)
    }
})

const upload = multer({ storage });

export const videoFeed = async (req: Request, res: Response): Promise<any> => {

    try {

        const { page = 1, limit = 20, category } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const itemsPerPage = Math.max(Number(limit) || 20, 1)


        const whereFilter = category ? { category: category.toString().toUpperCase() as any } : undefined;

        const videos = await prisma.video.findMany({
            where: whereFilter,
            skip: (currentPage - 1) * itemsPerPage,
            take: itemsPerPage,
            select: {
                id: true,
                title: true,
                thumbnail_url: true,
                creator: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                view_count: true,
                createdAt: true

            }

        })

        const totalVideo = await prisma.video.count({ where: whereFilter });
        const totalPages = Math.ceil(totalVideo / itemsPerPage)

        const responseData = {
            videos: videos.map((video) => ({
                id: video.id,
                title: video.title,
                thumbnail_url: video.thumbnail_url,
                creator: {
                    id: video.creator.id,
                    username: video.creator.username,
                },
                view_count: video.view_count,
                createdAt: video.createdAt.toISOString(),
            })),
            total_pages: totalPages,
            current_page: currentPage,
        }

        /// this schema validation is failing and need to check the zod video feed query schema
        // const validation = VideoFeedQuerySchema.safeParse(responseData);
        console.log(responseData, "sfdsdmvdklngkdnfbgkndgndkn")


        // if (!validation.success) {
        //     res.status(500).json({ message: "invalid parameters" })
        //     return
        // }

        return res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
        return
    }
}

export const uploadVideo = [upload.single("file"), async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.Authentication || req.headers.authorization?.split(" ")[1];
        console.log(req.cookies)
        console.log(req.headers)
        if (!token) {
            res.status(401).json({ message: "unauthorized" })
            return
        }
        let payload: string | JwtPayload;
        try {
            payload = jwt.verify(token, JWT_PASSWORD!);
            console.log({ payload })

        } catch (e) {
            console.log(e)
            res.status(401).json({ message: "Invalid or expired token" })
            return
        }

        if (typeof payload === "object" && "userId" in payload) {
            const userId = payload.userId as string

            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                include: { channel: true }

            })

            if (!user || !user.channel) {
                res.status(404).json({ message: "user channel not dound" })
                return
            }
            const channelId = user.channel.id;
            console.log("User and Channel Info:", { user, channelId });

            const { title, description, category } = req.body;


            const parsedData = VideoInputSchema.safeParse({ title, description, category })
            console.log(parsedData)
            if (!parsedData.success) {
                res.status(400).json({ message: "Invalid queary paramter" })
                return
            }

            if (!req.file) {
                res.status(400).json({ message: "Invalid file" })
                return
            }


            const video = await prisma.video.create({
                data: {
                    id: uuidv4(),
                    title: parsedData.data.title,
                    description: parsedData.data.description,
                    category: VideoCategory.TEST,
                    status: "PROCESSING",
                    channel: {
                        connect: { id: channelId },
                    },
                    creator: {
                        connect: { id: user.id },
                    },
                },
            });


            const qualities = ["240p", "480p", "720p"]


            // can create a map for quality / will have to update databae(videoUrl)
            // await Promise.all(
            //     qualities.map((quality) => {
            //         prisma.video.create({
            //             data: {
            //                 id: uuidv4(),
            //                 url: `/uploads/videos/${req.file?.fieldname}`,
            //                 videoId: video.id
            //             }
            //         })
            //     })
            // )

            const response = {
                id: video.id,
                title: video.title,
                processing_status: video.status,
                qualities: qualities
            }

            const validaiton = UploadVideoSchema.safeParse(response);
            console.log(validaiton)
            if (!validaiton.success) {
                res.status(400).json({ success: false, error: 'Invalid data' });
                return
            }
            console.log(response)
            res.status(200).json(response)
            return
        } else {
            res.status(400).json({ message: "Invalid token payload" });
            return;

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" })
        return
    }
}]


export const getVideoDetails = async (req: Request, res: Response): Promise<any> => {
    try {

        const { video_id } = req.params;

        const videoDetails = await prisma.video.findUnique({
            where: { id: video_id },
            select: {
                id: true,
                title: true,
                description: true,
                creator: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                status: true
            }

        })


        if (!videoDetails) {
            res.status(404).json({ message: "Video not found" })
            return
        }

        const validaiton = GetVideoDetailSchema.safeParse(videoDetails);
        if (!validaiton.success) {
            res.status(500).json({ message: "Response validaiton failed" })
        }
        return res.status(200).json(videoDetails);
    } catch (e) {
        res.status(500).json({ message: "Internal server error" })
    }

}
export const timeStampUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        const { video_id, timestamp } = req.body;

        if (!video_id || typeof timestamp !== "number" || timestamp < 0) {
            res.status(400).json({ message: "Invalid input data" });
            return;
        }

        const token = req.cookies.Authentication || req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let payload: string | JwtPayload;
        try {
            payload = jwt.verify(token, JWT_PASSWORD!);
        } catch (e) {
            console.log(e);
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

        if (typeof payload === "object" && "userId" in payload) {
            const userId = payload.userId as string;

            // Ensure the video exists
            const video = await prisma.video.findUnique({ where: { id: video_id } });
            if (!video) {
                res.status(404).json({ message: "Video not found" });
                return;
            }

            // Validate timestamp (e.g., ensure it doesn't exceed video duration if applicable)
            // Add video duration check here if duration is tracked.
            // Update or create a watch history entry
            const watchHistory = await prisma.watchHistory.upsert({
                where: {
                    userId_videoId: { userId, videoId: video_id }, // Using the unique constraint
                },
                update: {
                    timestamp,
                    watchedAt: new Date(),
                },
                create: {
                    userId,
                    videoId: video_id,
                    timestamp,
                    watchedAt: new Date(),
                },
            });

            res.status(201).json({ message: "Timestamp updated", watchHistory });
            return
        } else {
            res.status(400).json({ message: "Invalid token payload" });
        }
    } catch (error) {
        console.error("Error updating timestamp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


