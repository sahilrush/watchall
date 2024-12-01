import { SignInSchema, SignUpSchema } from "../types.ts/index.js"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { compare, hash } from "../scrypt.js";
import { PrismaClient } from "@prisma/client";
import { JWT_PASSWORD } from "../config.js";
const prisma = new PrismaClient();


export const signup = async (req: Request, res: Response): Promise<any> => {
    console.log(req.body)
    const parsedData = SignUpSchema.safeParse(req.body)
    console.log("successfully parse the data with ", parsedData)
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({ message: "Validation failed" })
        return
    }

    const hashedPassword = await hash(parsedData.data.password)

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email
            }

        })

        if (existingUser) return res.status(400).json({ error: "user already exists" })

        const user = await prisma.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                username: parsedData.data.username
            }
        })

        return res.status(201).json({
            userId: user.id

        })
    } catch (e) {
        console.log("erroer thrown")
        console.log(e)
        res.status(409).json({ message: "User already exists" })
    }
}



export const signin = async (req: Request, res: Response): Promise<any> => {
    console.log(req.body)
    const parsedData = SignInSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({ message: "Validation failed" })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        })

        if (!user) {
            res.status(403).json({ message: "User not found" })
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)

        if (!isValid) {
            res.status(403).json({ message: "Invalid password" })
            return
        }

        const token = jwt.sign({
            userId: user.id,
        }, JWT_PASSWORD)

        res.cookie("Authentication", token, {
            httpOnly:true,
            secure:true,
            sameSite:"strict"
        })

        return res.status(200).json({
           access_token: token,
           user:{
            id:user.id,
            username:user.username,
            email:user.email
           }
        })
        console.log(res)
    } catch (e) {
        res.status(400).json({ message: "Internal server error" })
    }
}