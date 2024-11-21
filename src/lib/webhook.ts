import crypto from "crypto";
import Campaign from "../models/campaingModel";
import { Request, Response } from "express";
import { paymentSuccessEmail } from "./sendEmail";
import { User } from "../models/usersModel";

const secret = process.env.PAYSTACK_KEY as string;

export async function paymentWebook(req: Request, res: Response) {
  const hash = crypto
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

      res.status(200);

      try {
        const user = await User.findOne({ _id: userId });
        const campaign = await Campaign.findOne({ _id: eventId });

        if (!campaign) {
          res.status(404).json({ message: "campaign not found" });
          return;
        }

        if (!user) {
          return;
        }

        const newCurrentAmount = campaign?.currentAmount + contributor.amount;

        await Campaign.updateOne(
          { _id: eventId },
          {
            $push: { contributors: contributor },
            $set: { currentAmount: newCurrentAmount },
          },
          { new: true }
        );

        await paymentSuccessEmail(
          user.name,
          contributor.amount,
          campaign.title,
          contributor.paid_at,
          user?.email
        );

        res.status(200).json({ message: "sent" });
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
  }
}
