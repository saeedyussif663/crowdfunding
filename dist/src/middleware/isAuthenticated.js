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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isAuthenticated;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
dotenv_1.default.config();
const accesstoken_secret = process.env.ACCESS_TOKEN_SECRET;
function isAuthenticated(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "Unauthorize" });
        return;
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, accesstoken_secret);
        req.user = user;
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
    next();
}
