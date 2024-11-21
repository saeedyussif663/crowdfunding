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
import swaggerUi from "swagger-ui-express";
import { paymentWebook } from "./lib/webhook";
import swaggerOutput from "./swagger_output.json";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

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
app.post("/webhook", paymentWebook);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  DBconnect();
});
