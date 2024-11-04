import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { DBconnect } from "./lib/db-connection";
import authRoutes from "./routes/authRoutes";
import isAuthenticated from "./middleware/isAuthenticated";
import { User } from "./models/usersModel";
import campaignRoutes from "./routes/campaignRoutes";
import axios from "axios";
import crypto from "crypto";
import { createTransport } from "nodemailer";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const transporter = createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "saeedyussif663@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the crowdfunding api");
});

// auth routes
app.use("/api/auth/", authRoutes);

// campaigns route
app.use("/api/campaign/", campaignRoutes);

// get user - protected
app.get(
  "/api/user/me",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const Id = req.user?.userId;
    const user = await User.findOne({ _id: Id });
    res.status(200).json({
      user: { email: user?.email, name: user?.name, phone: user?.phone },
    });
    return;
  }
);

// make payments
app.get("/api/donate", async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: "saaed@test.com",
        amount: "20000",
        currency: "GHS",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ message: "donating" });
});

app.post("/my/webhook/url", function (req, res) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET as string;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    const event = req.body;
    console.log(event);
  }
  res.sendStatus(200);
});

app.get("/email", async (req: Request, res: Response) => {
  const info = await transporter.sendMail({
    from: "Crowdfunding <saeedyussif663@gmail.com>",
    to: "saeedyussifj@gmail.com",
    subject: "Hello ✔",
    html: "<h1>Hello world?</h1>",
  });
  console.log(info);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  DBconnect();
});
