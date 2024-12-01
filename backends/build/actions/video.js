"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeStampUpdate = exports.getVideoDetails = exports.uploadVideo = exports.videoFeed = void 0;
const types_ts_1 = require("../types.ts");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const config_js_1 = require("../config.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const updatePath = path_1.default.resolve(__dirname, "../uploads/videos");
        cb(null, updatePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
const videoFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const itemsPerPage = Math.max(Number(limit) || 20, 1);
        const whereFilter = category ? { category: category.toString().toUpperCase() } : undefined;
        const videos = yield prisma.video.findMany({
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
        });
        const totalVideo = yield prisma.video.count({ where: whereFilter });
        const totalPages = Math.ceil(totalVideo / itemsPerPage);
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
        };
        /// this schema validation is failing and need to check the zod video feed query schema
        // const validation = VideoFeedQuerySchema.safeParse(responseData);
        console.log(responseData, "sfdsdmvdklngkdnfbgkndgndkn");
        // if (!validation.success) {
        //     res.status(500).json({ message: "invalid parameters" })
        //     return
        // }
        return res.status(200).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.videoFeed = videoFeed;
exports.uploadVideo = [upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = req.cookies.Authentication || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
            console.log(req.cookies);
            console.log(req.headers);
            if (!token) {
                res.status(401).json({ message: "unauthorized" });
                return;
            }
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
                console.log({ payload });
            }
            catch (e) {
                console.log(e);
                res.status(401).json({ message: "Invalid or expired token" });
                return;
            }
            if (typeof payload === "object" && "userId" in payload) {
                const userId = payload.userId;
                const user = yield prisma.user.findUnique({
                    where: { id: payload.userId },
                    include: { channel: true }
                });
                if (!user || !user.channel) {
                    res.status(404).json({ message: "user channel not dound" });
                    return;
                }
                const channelId = user.channel.id;
                console.log("User and Channel Info:", { user, channelId });
                const { title, description, category } = req.body;
                const parsedData = types_ts_1.VideoInputSchema.safeParse({ title, description, category });
                console.log(parsedData);
                if (!parsedData.success) {
                    res.status(400).json({ message: "Invalid queary paramter" });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({ message: "Invalid file" });
                    return;
                }
                const video = yield prisma.video.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        title: parsedData.data.title,
                        description: parsedData.data.description,
                        category: client_1.VideoCategory.TEST,
                        status: "PROCESSING",
                        channel: {
                            connect: { id: channelId },
                        },
                        creator: {
                            connect: { id: user.id },
                        },
                    },
                });
                const qualities = ["240p", "480p", "720p"];
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
                };
                const validaiton = types_ts_1.UploadVideoSchema.safeParse(response);
                console.log(validaiton);
                if (!validaiton.success) {
                    res.status(400).json({ success: false, error: 'Invalid data' });
                    return;
                }
                console.log(response);
                res.status(200).json(response);
                return;
            }
            else {
                res.status(400).json({ message: "Invalid token payload" });
                return;
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }
    })];
const getVideoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { video_id } = req.params;
        const videoDetails = yield prisma.video.findUnique({
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
        });
        if (!videoDetails) {
            res.status(404).json({ message: "Video not found" });
            return;
        }
        const validaiton = types_ts_1.GetVideoDetailSchema.safeParse(videoDetails);
        if (!validaiton.success) {
            res.status(500).json({ message: "Response validaiton failed" });
        }
        return res.status(200).json(videoDetails);
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVideoDetails = getVideoDetails;
const timeStampUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { video_id, timestamp } = req.body;
        if (!video_id || typeof timestamp !== "number" || timestamp < 0) {
            res.status(400).json({ message: "Invalid input data" });
            return;
        }
        const token = req.cookies.Authentication || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
        }
        catch (e) {
            console.log(e);
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        if (typeof payload === "object" && "userId" in payload) {
            const userId = payload.userId;
            // Ensure the video exists
            const video = yield prisma.video.findUnique({ where: { id: video_id } });
            if (!video) {
                res.status(404).json({ message: "Video not found" });
                return;
            }
            // Validate timestamp (e.g., ensure it doesn't exceed video duration if applicable)
            // Add video duration check here if duration is tracked.
            // Update or create a watch history entry
            const watchHistory = yield prisma.watchHistory.upsert({
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
            return;
        }
        else {
            res.status(400).json({ message: "Invalid token payload" });
        }
    }
    catch (error) {
        console.error("Error updating timestamp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.timeStampUpdate = timeStampUpdate;
