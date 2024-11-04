import { Request, Response, Router } from "express";
import {
  createCampaign,
  deleteCampaing,
  editCampaign,
} from "../controllers/campaignController";

const campaignRoutes = Router();

campaignRoutes.get("/", (req: Request, res: Response) => {
  res.send("get all campaigns");
});

// create a campaign
campaignRoutes.post("/create", createCampaign);

// edit a campaign
campaignRoutes.put("/edit/:id", editCampaign);

// delete a campaign
campaignRoutes.delete("/delete/:id", deleteCampaing);

export default campaignRoutes;
