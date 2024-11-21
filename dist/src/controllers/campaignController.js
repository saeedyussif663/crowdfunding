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
exports.getAllCampaigns = getAllCampaigns;
exports.getACampaign = getACampaign;
exports.createCampaign = createCampaign;
exports.editCampaign = editCampaign;
exports.deleteCampaing = deleteCampaing;
const campaingModel_1 = __importDefault(require("../models/campaingModel"));
function getAllCampaigns(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = {};
        const category = req.query.category;
        const limit = req.query.limit;
        const sortby = req.query.sortby;
        const sortOrder = sortby === "asc" ? 1 : sortby === "desc" ? -1 : undefined;
        if (category)
            filter.category = category;
        try {
            const campaigns = yield campaingModel_1.default.find(filter)
                .sort(sortOrder ? { amountExpected: sortOrder } : {})
                .populate({
                path: "creator",
                select: "name -_id",
                transform: (doc) => doc.name,
            })
                .populate({
                path: "contributors.name",
                select: "name -_id",
                transform: (doc) => doc.name,
            })
                .select("-__v")
                .limit(+limit);
            res.status(200).json({ message: "successfull", data: campaigns });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "an error occured" });
            return;
        }
    });
}
function getACampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const campaign = yield campaingModel_1.default.findById({ _id: id })
                .populate({
                path: "creator",
                select: "name -_id",
            })
                .populate({ path: "contributors.name", select: "name" });
            if (!campaign) {
                res.status(404).json({ message: "campaign not found" });
                return;
            }
            res.status(200).json({
                message: "successful",
                data: {
                    id: campaign === null || campaign === void 0 ? void 0 : campaign._id,
                    title: campaign === null || campaign === void 0 ? void 0 : campaign.title,
                    description: campaign === null || campaign === void 0 ? void 0 : campaign.description,
                    amountExpected: campaign === null || campaign === void 0 ? void 0 : campaign.amountExpected,
                    currentAmount: campaign === null || campaign === void 0 ? void 0 : campaign.currentAmount,
                    imageUrl: campaign === null || campaign === void 0 ? void 0 : campaign.imageUrl,
                    category: campaign === null || campaign === void 0 ? void 0 : campaign.category,
                    creator: campaign === null || campaign === void 0 ? void 0 : campaign.creator.name,
                },
            });
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
    });
}
function createCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { title, description, amountExpected, imageUrl, category } = req.body;
        const creator = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        try {
            const campaign = yield campaingModel_1.default.create({
                title,
                description,
                amountExpected,
                imageUrl,
                creator,
                category,
            });
            res.status(201).json({
                message: "campaing created successfully",
                data: {
                    id: campaign._id,
                    title: campaign === null || campaign === void 0 ? void 0 : campaign.title,
                    description: campaign === null || campaign === void 0 ? void 0 : campaign.description,
                    amountExpected: campaign === null || campaign === void 0 ? void 0 : campaign.amountExpected,
                    imageUrl: campaign === null || campaign === void 0 ? void 0 : campaign.imageUrl,
                    creator: campaign === null || campaign === void 0 ? void 0 : campaign.creator,
                    category: campaign === null || campaign === void 0 ? void 0 : campaign.category,
                    contributors: campaign === null || campaign === void 0 ? void 0 : campaign.contributors,
                    currentAmount: campaign === null || campaign === void 0 ? void 0 : campaign.currentAmount,
                },
            });
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
function editCampaign(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const id = req.params.id;
        const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { title, description, amountExpected, imageUrl, category } = req.body;
        try {
            const campaign = yield campaingModel_1.default.findOne({ _id: id });
            if (((_b = campaign === null || campaign === void 0 ? void 0 : campaign.creator) === null || _b === void 0 ? void 0 : _b.toString()) !== user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            if (!campaign) {
                res.status(404).json({ message: "campaign not found" });
                return;
            }
        }
        catch (error) {
            if (error.name === "CastError") {
                res.status(404).json({ message: "campaign not found" });
                return;
            }
            res.status(500).json({ message: "An error occured" });
            return;
        }
        try {
            yield campaingModel_1.default.updateOne({ _id: id }, { title, description, amountExpected, imageUrl, category }, { runValidators: true });
            res.status(200).json({
                message: "updated campaign successfully",
            });
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
function deleteCampaing(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const id = req.params.id;
        const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        try {
            const campaign = yield campaingModel_1.default.findById({ _id: id });
            if (((_b = campaign === null || campaign === void 0 ? void 0 : campaign.creator) === null || _b === void 0 ? void 0 : _b.toString()) !== user) {
                console.log("here");
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
        }
        catch (error) {
            if (error.name === "CastError") {
                res.status(404).json({ message: "campaign not found" });
                return;
            }
            res.status(500).json({ message: "An error occured" });
            return;
        }
        try {
            yield campaingModel_1.default.deleteOne({ _id: id });
            res.status(200).json({ message: "deleted successfully" });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "an error occured" });
        }
    });
}
