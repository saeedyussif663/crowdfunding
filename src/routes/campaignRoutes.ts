import { Request, Response, Router } from "express";
import {
  createCampaign,
  deleteCampaing,
  editCampaign,
  getACampaign,
  getAllCampaigns,
} from "../controllers/campaignController";

const campaignRoutes = Router();

// get all campaigns
campaignRoutes.get("/", getAllCampaigns);

// get a campaign
campaignRoutes.get("/:id", getACampaign);

// create a campaign
campaignRoutes.post("/create", createCampaign);

// edit a campaign
campaignRoutes.put("/edit/:id", editCampaign);

// delete a campaign
campaignRoutes.delete("/delete/:id", deleteCampaing);

export default campaignRoutes;
