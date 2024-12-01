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
exports.signin = exports.signup = void 0;
const types_ts_1 = require("../types.ts");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const scrypt_js_1 = require("../scrypt.js");
const client_1 = require("@prisma/client");
const config_js_1 = require("../config.js");
const prisma = new client_1.PrismaClient();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const parsedData = types_ts_1.SignUpSchema.safeParse(req.body);
    console.log("successfully parse the data with ", parsedData);
    if (!parsedData.success) {
        console.log("parsed data incorrect");
        res.status(400).json({ message: "Validation failed" });
        return;
    }
    const hashedPassword = yield (0, scrypt_js_1.hash)(parsedData.data.password);
    try {
        const existingUser = yield prisma.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        });
        if (existingUser)
            return res.status(400).json({ error: "user already exists" });
        const user = yield prisma.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                username: parsedData.data.username
            }
        });
        return res.status(201).json({
            userId: user.id
        });
    }
    catch (e) {
        console.log("erroer thrown");
        console.log(e);
        res.status(409).json({ message: "User already exists" });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const parsedData = types_ts_1.SignInSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({ message: "Validation failed" });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        });
        if (!user) {
            res.status(403).json({ message: "User not found" });
            return;
        }
        const isValid = yield (0, scrypt_js_1.compare)(parsedData.data.password, user.password);
        if (!isValid) {
            res.status(403).json({ message: "Invalid password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, config_js_1.JWT_PASSWORD);
        res.cookie("Authentication", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        return res.status(200).json({
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
        console.log(res);
    }
    catch (e) {
        res.status(400).json({ message: "Internal server error" });
    }
});
exports.signin = signin;
