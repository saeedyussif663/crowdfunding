"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBconnect = DBconnect;
const mongoose_1 = __importDefault(require("mongoose"));
function DBconnect() {
    mongoose_1.default
        .connect(process.env.CONNECTION_STRING)
        .then((res) => console.log("connected to database successfully"))
        .catch((err) => console.log({ err }));
}
