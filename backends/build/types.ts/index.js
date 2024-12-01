"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTimestampSchema = exports.GetVideoDetailSchema = exports.UploadVideoSchema = exports.VideoInputSchema = exports.GetChannelSchema = exports.ChannelSchema = exports.VideoFeedQuerySchema = exports.SignInSchema = exports.SignUpSchema = void 0;
const zod_1 = __importStar(require("zod"));
exports.SignUpSchema = zod_1.default.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6),
    username: zod_1.z.string(),
});
exports.SignInSchema = zod_1.default.object({
    email: zod_1.z.string(),
    password: zod_1.z.string()
});
exports.VideoFeedQuerySchema = zod_1.z.object({
    videos: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        title: zod_1.z.string(),
        thumbnail_url: zod_1.z.string().nullable(),
        creator: zod_1.z.object({
            id: zod_1.z.string().uuid(),
            username: zod_1.z.string(),
        }),
        view_count: zod_1.z.number().int().nonnegative(),
        created_at: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }),
    })),
    total_pages: zod_1.z.number().int().nonnegative(),
    current_page: zod_1.z.number().int().nonnegative(),
});
exports.ChannelSchema = zod_1.default.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    slug: zod_1.z.string()
});
exports.GetChannelSchema = zod_1.default.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    subscriber_count: zod_1.z.number(),
    video: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        thumbnail_url: zod_1.z.string().url()
    }))
});
exports.VideoInputSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string(),
});
exports.UploadVideoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    processing_status: zod_1.z.enum(["PROCESSING", "TRANSCODED"]),
    qualities: zod_1.z.array(zod_1.z.enum(["240p", "480p", "720p"])), // Array of enums for qualities
});
exports.GetVideoDetailSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    creator: zod_1.z.object({
        id: zod_1.z.string(),
        username: zod_1.z.string(),
    }),
    status: zod_1.z.string(),
});
exports.UpdateTimestampSchema = zod_1.z.object({
    video_id: zod_1.z.string(),
    timestamp: zod_1.z.number()
});
