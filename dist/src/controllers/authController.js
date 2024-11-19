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
exports.signup = signup;
exports.signin = signin;
exports.refreshToken = refreshToken;
exports.forgotPassword = forgotPassword;
exports.setPassword = setPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const usersModel_1 = require("../models/usersModel");
const sendEmail_1 = require("../lib/sendEmail");
dotenv_1.default.config();
const accesstoken_secret = process.env.ACCESS_TOKEN_SECRET;
const accesstoken_duration = process.env.ACCESS_TOKEN_DURATION;
const refreshtoken_secret = process.env.REFRESH_TOKEN_SECRET;
const refreshtoken_duration = process.env.REFRESH_TOKEN_DURATION;
const resettoken_secret = process.env.RESET_PASSWORD_SECRET;
const resettoken_duration = process.env.RESET_PASSWORD_DURATION;
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, name, password } = req.body;
        const existingUser = yield usersModel_1.User.findOne({ email });
        if (existingUser) {
            res.status(422).json({ message: "A user with the email already exists" });
            return;
        }
        if (!password) {
            res.status(422).json({ message: "Password is required" });
            return;
        }
        const hasedPassword = yield bcrypt_1.default.hash(password, 10);
        try {
            const newUser = yield usersModel_1.User.create({
                name,
                email,
                password: hasedPassword,
            });
            res.status(201).json({
                message: "User created successfully",
                data: {
                    name: newUser.name,
                    email: newUser.email,
                },
            });
            yield (0, sendEmail_1.sendEmail)(newUser.name, newUser.email);
            return;
        }
        catch (error) {
            if (error.name === "ValidationError") {
                res
                    .status(422)
                    .json({ message: error.message.split(":").slice(2).join(":").trim() });
                return;
            }
            res.status(500).json({ message: "An error occured" });
            return;
        }
    });
}
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(422).json({ message: "Email and Password are required" });
            return;
        }
        const user = yield usersModel_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id }, accesstoken_secret, {
            expiresIn: accesstoken_duration,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, refreshtoken_secret, {
            expiresIn: refreshtoken_duration,
        });
        res.status(200).json({
            user: { email: user.email, name: user.name },
            accessToken,
            refreshToken,
        });
        return;
    });
}
function refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(422).json({ message: "Refresh token is required" });
        return;
    }
    try {
        const user = jsonwebtoken_1.default.verify(refreshToken, refreshtoken_secret);
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.userId }, accesstoken_secret, {
            expiresIn: accesstoken_duration,
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user.userId }, refreshtoken_secret, {
            expiresIn: refreshtoken_duration,
        });
        res
            .status(200)
            .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        return;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError ||
            error instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        res.status(500).json({ message: "An error occured" });
        return;
    }
}
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        if (!email) {
            res.status(422).json({ message: "Email is required" });
            return;
        }
        const user = yield usersModel_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, resettoken_secret, {
            expiresIn: resettoken_duration,
        });
        res.status(200).json({ token });
        return;
    });
}
function setPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token, password, confirmPassword } = req.body;
        if (!token || !password) {
            res.status(422).json({ message: "Token and passwod required" });
            return;
        }
        if (!(password === confirmPassword)) {
            res.status(422).json({ message: "Passwords don't match" });
            return;
        }
        try {
            const isTokenValid = jsonwebtoken_1.default.verify(token, resettoken_secret);
            const hasedPassword = yield bcrypt_1.default.hash(password, 10);
            const updatedUser = yield usersModel_1.User.findByIdAndUpdate(isTokenValid.userId, {
                password: hasedPassword,
            }, { runValidators: true });
            res.status(200).json({ message: "Password reset successfully" });
            return;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError ||
                error instanceof jsonwebtoken_1.JsonWebTokenError) {
                res.status(401).json({ message: "Invalid token" });
                return;
            }
            res.status(500).json({ message: "An error occured" });
            return;
        }
    });
}
