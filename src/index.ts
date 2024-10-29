import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { DBconnect } from "./lib/db-connection";
import authRoutes from "./routes/authRoutes";
import isAuthenticated from "./middleware/isAuthenticated";
import { User } from "./models/usersModel";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the crowdfunding api");
});

// auth routes
app.use("/api/auth/", authRoutes);

// get user - protected
app.get(
  "/api/user/me",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const Id = req.user?.userId;
    const user = await User.findOne({ _id: Id });
    res
      .status(200)
      .json({
        user: { email: user?.email, name: user?.name, phone: user?.phone },
      });
    return;
  }
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  DBconnect();
});
