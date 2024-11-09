import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { DBconnect } from "./lib/db-connection";
import authRoutes from "./routes/authRoutes";
import isAuthenticated from "./middleware/isAuthenticated";
import { User } from "./models/usersModel";
import campaignRoutes from "./routes/campaignRoutes";
import makePayments from "./lib/payment";
import cors from "cors";
import upload from "express-fileupload";
import uploadImage from "./lib/upload";
import crypto from "crypto";
import Campaign from "./models/campaingModel";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const secret = process.env.PAYSTACK_KEY as string;
app.use(cors());
app.use(express.json());
app.use(upload());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the crowdfunding api");
});

// auth routes
app.use("/api/auth/", authRoutes);

// campaigns route
app.use("/api/campaign/", campaignRoutes);

// upload image
app.post("/api/upload", uploadImage);

// get user - protected
app.get(
  "/api/user/me",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const Id = req.user?.userId;
    const user = await User.findOne({ _id: Id });
    res.status(200).json({
      user: { email: user?.email, name: user?.name },
    });
    return;
  }
);

// make payments
app.post("/api/donate/:id", isAuthenticated, makePayments);

// payment success webhook
app.post("/webhook", async function (req: Request, res: Response) {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    const eventStatus = req.body.event;
    const event = req.body;

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

      try {
        const campaign = await Campaign.findOne({ _id: eventId });

        if (campaign) {
          const newCurrentAmount = campaign?.currentAmount + contributor.amount;

          await Campaign.updateOne(
            { _id: eventId },
            {
              $push: { contributors: contributor },
              $set: { currentAmount: newCurrentAmount },
            },
            { new: true }
          );
        }

        res.status(404).json({ message: "campaign not found" });
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
  res.status(200).json({ message: "payment successfull" });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  DBconnect();
});
