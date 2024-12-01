import { decode, verify } from "jsonwebtoken"
import { ChannelSchema, GetChannelSchema } from "../types.ts/index.js"
import e, { Request, response, Response } from "express"
import { JWT_PASSWORD } from "../config.js"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export const createChanel = async (req: Request, res: Response):Promise<any> => {
    // Validate the request body against the schema
    const parsedData = ChannelSchema.safeParse(req.body);
    console.log("Parsed data:", parsedData);

    if (!parsedData.success) {``
        res.status(400).json({ message: "Invalid parameters" });
        return;
    }

    const { name, slug, description } = parsedData.data;

    try {
        // Extract the token from cookies or headersre
        const token = req.cookies.Authentication || req.headers.authorization?.split(" ")[1];
        console.log("Token extracted:", token);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let userId: string;

        // Verify the token and extract the user ID
        try {
            const decoded = jwt.verify(token, JWT_PASSWORD) as { userId: string };
            userId = decoded.userId;
        } catch (e) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        console.log("User ID:", userId);


        // Check if the user already has a channel
        const existingChannel = await prisma.channel.findUnique({
            where: { userId },
        });

        if (existingChannel) {
            res.status(411).json({ message: "Channel already exists" });
            return;
        }

        // Check if the slug is already in use
        const existingSlug = await prisma.channel.findUnique({
            where: { slug },
        });

        if (existingSlug) {
            res.status(409).json({ message: "Slug already exists" });
            return;
        }

        // Create a new channel
        const newChannel = await prisma.channel.create({
            data: {
                name,
                description: description || null,
                slug,
                userId,
            },
        });

        res.status(201).json({ newChannel, message: "Channel successfully created" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getChannelDetail = async (req: Request, res: Response): Promise<any> => {
    try {
        const { slug } = req.params;
        console.log("Channel Slug:", slug);

        const token = req.cookies.Authentication || req.headers.authorization?.split(" ")[1];
        console.log("Extracted Token:", token);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            jwt.verify(token, JWT_PASSWORD);
        } catch (error) {
            console.error("Token Verification Error:", error);
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const channel = await prisma.channel.findUnique({
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
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
