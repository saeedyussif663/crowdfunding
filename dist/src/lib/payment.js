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
exports.default = makePayments;
const campaingModel_1 = __importDefault(require("../models/campaingModel"));
const usersModel_1 = require("../models/usersModel");
const axios_1 = __importDefault(require("axios"));
function makePayments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { amount } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const eventId = req.params.id;
        try {
            const campaign = yield campaingModel_1.default.findOne({ _id: eventId });
            const user = yield usersModel_1.User.findOne({ _id: userId });
            const { data } = yield axios_1.default.post(`${process.env.PAYSTACK_BASE_URL}/transaction/initialize`, {
                email: user === null || user === void 0 ? void 0 : user.email,
                amount: amount * 100,
                currency: "GHS",
                metadata: { eventId, userId },
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            res.status(200).json({ url: data.data.authorization_url });
        }
        catch (error) {
            if (error.name === "CastError") {
                res.status(404).json({ message: "campaign not found" });
                return;
            }
            res.status(500).json({ message: "An error occured" });
            return;
        }
        res.status(200);
    });
}
