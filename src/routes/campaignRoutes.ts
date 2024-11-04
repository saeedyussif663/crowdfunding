import { Request, Response, Router } from "express";
import {
  createCampaign,
  deleteCampaing,
  editCampaign,
  getACampaign,
  getAllCampaigns,
} from "../controllers/campaignController";
import isAuthenticated from "../middleware/isAuthenticated";

const campaignRoutes = Router();

// get all campaigns
campaignRoutes.get("/", getAllCampaigns);

// get a campaign
campaignRoutes.get("/:id", isAuthenticated, getACampaign);

// create a campaign
campaignRoutes.post("/create", isAuthenticated, createCampaign);

// edit a campaign
campaignRoutes.put("/edit/:id", isAuthenticated, editCampaign);

// delete a campaign
campaignRoutes.delete("/delete/:id", isAuthenticated, deleteCampaing);

export default campaignRoutes;
