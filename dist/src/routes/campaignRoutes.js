"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaignController_1 = require("../controllers/campaignController");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const campaignRoutes = (0, express_1.Router)();
// get all campaigns
campaignRoutes.get("/", campaignController_1.getAllCampaigns);
// get a campaign
campaignRoutes.get("/:id", campaignController_1.getACampaign);
// create a campaign
campaignRoutes.post("/create", isAuthenticated_1.default, campaignController_1.createCampaign);
// edit a campaign
campaignRoutes.put("/edit/:id", isAuthenticated_1.default, campaignController_1.editCampaign);
// delete a campaign
campaignRoutes.delete("/delete/:id", isAuthenticated_1.default, campaignController_1.deleteCampaing);
exports.default = campaignRoutes;
