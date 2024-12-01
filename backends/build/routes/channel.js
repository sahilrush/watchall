"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelRouter = void 0;
const express_1 = require("express");
const channel_1 = require("../actions/channel");
exports.channelRouter = (0, express_1.Router)();
exports.channelRouter.post("", channel_1.createChanel);
exports.channelRouter.get("/:slug", channel_1.getChannelDetail);
