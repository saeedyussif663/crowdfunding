"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const campaignsSchema = new mongoose_1.Schema({
    title: { type: String, required: [true, "title is required"] },
    description: { type: String, required: [true, "description is required"] },
    amountExpected: {
        type: Number,
        required: [true, "amount expected is required"],
    },
    imageUrl: {
        type: String,
        required: [true, "Campaign image URL is required"],
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Campaign creator is required"],
        immutable: true,
    },
    contributors: [
        {
            name: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            amount: { type: Number, required: true },
            paid_at: { type: String, required: true },
            method: {
                type: String,
                enum: {
                    values: ["card", "mobile_money"],
                    message: "method must be either 'card' or 'mobile_money' ",
                },
            },
        },
    ],
    currentAmount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        enum: {
            values: ["technology", "healthcare", "sports", "education"],
            message: "category must be either 'technology', 'healthcare', 'sports', 'education'",
        },
        required: [true, "Category is required"],
    },
}, { timestamps: true });
const Campaign = (0, mongoose_1.model)("Campaign", campaignsSchema);
exports.default = Campaign;
