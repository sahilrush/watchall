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
exports.getChannelDetail = exports.createChanel = void 0;
const types_ts_1 = require("../types.ts");
const config_js_1 = require("../config.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createChanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Validate the request body against the schema
    const parsedData = types_ts_1.ChannelSchema.safeParse(req.body);
    console.log("Parsed data:", parsedData);
    if (!parsedData.success) {
        ``;
        res.status(400).json({ message: "Invalid parameters" });
        return;
    }
    const { name, slug, description } = parsedData.data;
    try {
        // Extract the token from cookies or headersre
        const token = req.cookies.Authentication || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
        console.log("Token extracted:", token);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let userId;
        // Verify the token and extract the user ID
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
            userId = decoded.userId;
        }
        catch (e) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        console.log("User ID:", userId);
        // Check if the user already has a channel
        const existingChannel = yield prisma.channel.findUnique({
            where: { userId },
        });
        if (existingChannel) {
            res.status(411).json({ message: "Channel already exists" });
            return;
        }
        // Check if the slug is already in use
        const existingSlug = yield prisma.channel.findUnique({
            where: { slug },
        });
        if (existingSlug) {
            res.status(409).json({ message: "Slug already exists" });
            return;
        }
        // Create a new channel
        const newChannel = yield prisma.channel.create({
            data: {
                name,
                description: description || null,
                slug,
                userId,
            },
        });
        res.status(201).json({ newChannel, message: "Channel successfully created" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createChanel = createChanel;
const getChannelDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { slug } = req.params;
        console.log("Channel Slug:", slug);
        const token = req.cookies.Authentication || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
        console.log("Extracted Token:", token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
        }
        catch (error) {
            console.error("Token Verification Error:", error);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        const channel = yield prisma.channel.findUnique({
            where: { slug: slug.toLowerCase() },
            include: {
                videos: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail_url: true
                    }
                }
            }
        });
        console.log("Fetched Channel:", channel);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        const responseData = {
            id: channel.id,
            name: channel.name,
            description: channel.description || null,
            subscriber_count: channel.subscriber_count,
            videos: channel.videos.map(video => ({
                id: video.id,
                title: video.title,
                thumbnail_url: video.thumbnail_url
            }))
        };
        console.log("Formatted Response Data:", responseData);
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getChannelDetail = getChannelDetail;
