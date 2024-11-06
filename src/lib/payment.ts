import { Request, Response } from "express";
import Campaign from "../models/campaingModel";
import { User } from "../models/usersModel";
import axios from "axios";

interface paystackRes {
  status: Boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export default async function makePayments(req: Request, res: Response) {
  const { amount } = req.body;
  const userId = req.user?.userId;
  const eventId = req.params.id;

  try {
    const campaign = await Campaign.findOne({ _id: eventId });
    const user = await User.findOne({ _id: userId });
    const { data } = await axios.post<paystackRes>(
      `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: user?.email,
        amount: amount * 100,
        currency: "GHS",
        metadata: { eventId, userId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data.data.authorization_url);
    res.redirect(data.data.authorization_url);
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(404).json({ message: "campaign not found" });
      return;
    }
    res.status(500).json({ message: "An error occured" });
    return;
  }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
  //       {
  //         email: "saaed@test.com",
  //         amount: amount,
  //         currency: "GHS",
  //         metadata: { eventId: "1" },
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log(response.data);
  //   } catch (error: any) {
  //     res.status(500).json({ message: error.message });
  //   }

  res.status(200);
}
