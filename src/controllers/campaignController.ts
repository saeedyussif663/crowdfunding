import { Request, Response } from "express";
import Campaign from "../models/campaingModel";
import { Document, Types } from "mongoose";

interface IUser {
  _id: Types.ObjectId;
  name: string;
}

interface ICampaign extends Document {
  title: string;
  description: string;
  amountExpected: number;
  currentAmount: number;
  status: string;
  imageUrl: string;
  category: string;
  creator: IUser;
}

export async function getAllCampaigns(req: Request, res: Response) {
  try {
    const campaigns = await Campaign.find({})
      .populate({
        path: "creator",
        select: "name -_id",
      })
      .populate({
        path: "contributors.user",
        select: "name -_id",
      });
    res.status(200).json({ message: "successfull", data: campaigns });
    return;
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
    return;
  }
}

export async function getACampaign(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const campaign = await Campaign.findById({ _id: id })
      .populate<{ creator: IUser }>({
        path: "creator",
        select: "name -_id",
      })
      .populate({ path: "contributors.user", select: "name" });

    res.status(200).json({
      message: "successful",
      data: {
        id: campaign?._id,
        title: campaign?.title,
        description: campaign?.description,
        amountExpected: campaign?.amountExpected,
        currentAmount: campaign?.currentAmount,
        status: campaign?.status,
        imageUrl: campaign?.imageUrl,
        category: campaign?.category,
        creator: campaign?.creator.name,
      },
    });
    return;
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(404).json({ message: "campaign not found" });
      return;
    }
    res.status(500).json({ message: "An error occured" });
    return;
  }
}

export async function createCampaign(req: Request, res: Response) {
  const { title, description, amountExpected, imageUrl, category } = req.body;
  const creator = req.user?.userId;

  try {
    const campaign = await Campaign.create({
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
        title: campaign?.title,
        description: campaign?.description,
        amountExpected: campaign?.amountExpected,
        imageUrl: campaign?.imageUrl,
        creator: campaign?.creator,
        category: campaign?.category,
        status: campaign?.status,
        contributors: campaign?.contributors,
        currentAmount: campaign?.currentAmount,
      },
    });
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
  const user = req.user?.userId;

  if (status !== "active" && status !== "cancelled" && status !== "completed") {
    res.status(422).json({
      message: "status should either be active, cancelled or completed",
    });
    return;
  }

  try {
    const campaign = await Campaign.findOne({ _id: id });

    if (campaign?.creator?.toString() !== user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

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
  const user = req.user?.userId;

  try {
    const campaign = await Campaign.findById({ _id: id });
    if (campaign?.creator?.toString() !== user) {
      res.status(401).json({ message: "Unauthorized" });
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
    await Campaign.deleteOne({ _id: id });
    res.status(204);
    return;
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
}
