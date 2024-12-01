import { Router } from "express"
import { signin, signup } from "../actions"
import { channelRouter } from "./channel"
import { videoRouter } from "./video"

const router = Router()

router.get("/health",(req,res)=>{
    res.send("API Server is running")
})
router.post("/auth/signup",signup)
router.post("/auth/login",signin)
router.use("/channels",channelRouter)
router.use("/videos",videoRouter)



export default router;
