import { Request, Response } from "express";
import Campaign from "../models/campaingModel";

export async function createCampaign(req: Request, res: Response) {
  const { title, description, amountExpected, imageUrl, creator, category } =
    req.body;

  try {
    const campaign = await Campaign.create({
      title,
      description,
      amountExpected,
      imageUrl,
      creator,
      category,
    });

    res
      .status(201)
      .json({ message: "campaing created successfully", data: campaign });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res
        .status(422)
        .json({ message: error.message.split(":").slice(2).join(":").trim() });
      return;
    }
    res.status(500).json({ message: "An error occured" });
    return;
  }
}

export async function editCampaign(req: Request, res: Response) {
  const id = req.params.id;
  const status = req.body.status;

  if (status !== "active" && status !== "cancelled" && status !== "completed") {
    res.status(422).json({
      message: "status should either be active, cancelled or completed",
    });
    return;
  }

  try {
    const campaign = await Campaign.findOne({ _id: id });

    if (!campaign) {
      res.status(404).json({ message: "campaign not found" });
      return;
    }
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(404).json({ message: "campaign not found" });
      return;
    }
    res.status(500).json({ message: "An error occured" });
    return;
  }

  try {
    await Campaign.updateOne({ _id: id }, req.body);

    res.status(204).json({
      message: "updated campaign successfully",
    });
    return;
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res
        .status(422)
        .json({ message: error.message.split(":").slice(2).join(":").trim() });
      return;
    }

    res.status(500).json({ message: "An error occured" });
    return;
  }
}

export async function deleteCampaing(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const campaign = await Campaign.findById({ _id: id });
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(404).json({ message: "campaign not found" });
      return;
    }
    res.status(500).json({ message: "An error occured" });
    return;
  }

  try {
    await Campaign.deleteOne({ _id: id });
    res.status(204);
    return;
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
}
