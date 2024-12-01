import { Router } from "express";
import { createChanel, getChannelDetail } from "../actions/channel";


export const channelRouter  = Router();


channelRouter.post("",createChanel);
channelRouter.get("/:slug",getChannelDetail);