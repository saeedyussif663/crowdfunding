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
exports.paymentWebook = paymentWebook;
const crypto_1 = __importDefault(require("crypto"));
const campaingModel_1 = __importDefault(require("../models/campaingModel"));
const sendEmail_1 = require("./sendEmail");
const secret = process.env.PAYSTACK_KEY;
function paymentWebook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = crypto_1.default
            .createHmac("sha512", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash == req.headers["x-paystack-signature"]) {
            const eventStatus = req.body.event;
            if (eventStatus === "charge.success") {
                const event = req.body.data;
                const { metadata } = event;
                const { userId, eventId } = metadata;
                const contributor = {
                    name: userId,
                    amount: event.amount / 100,
                    paid_at: event.paid_at,
                    method: event.channel,
                };
                console.log(contributor);
                res.status(200);
                try {
                    const campaign = yield campaingModel_1.default.findOne({ _id: eventId });
                    if (!campaign) {
                        res.status(404).json({ message: "campaign not found" });
                        return;
                    }
                    const newCurrentAmount = (campaign === null || campaign === void 0 ? void 0 : campaign.currentAmount) + contributor.amount;
                    yield campaingModel_1.default.updateOne({ _id: eventId }, {
                        $push: { contributors: contributor },
                        $set: { currentAmount: newCurrentAmount },
                    }, { new: true });
                    yield (0, sendEmail_1.paymentSuccessEmail)("helo", contributor.amount, campaign.title, contributor.paid_at, "saeedyussif663@gmail.com");
                    res.status(200).json({ message: "sent" });
                    return;
                }
                catch (error) {
                    if (error.name === "CastError") {
                        res.status(404).json({ message: "campaign not found" });
                        return;
                    }
                    res.status(500).json({ message: "An error occured" });
                    return;
                }
            }
        }
    });
}
