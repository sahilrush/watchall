"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const actions_1 = require("../actions");
const channel_1 = require("./channel");
const video_1 = require("./video");
const router = (0, express_1.Router)();
router.get("/health", (req, res) => {
    res.send("API Server is running");
});
router.post("/auth/signup", actions_1.signup);
router.post("/auth/login", actions_1.signin);
router.use("/channels", channel_1.channelRouter);
router.use("/videos", video_1.videoRouter);
exports.default = router;
