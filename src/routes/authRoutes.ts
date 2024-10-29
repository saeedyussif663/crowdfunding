import { Router, Response, Request } from "express";
import {
  forgotPassword,
  refreshToken,
  setPassword,
  signin,
  signup,
} from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";

const authRoutes = Router();

// signup
authRoutes.post("/sign-up", signup);

// signin
authRoutes.post("/sign-in", signin);

// refresh-token
authRoutes.post("/refresh-token", refreshToken);

// forgot-password
authRoutes.post("/forgot-password", forgotPassword);

// set-password
authRoutes.post("/set-password", setPassword);

export default authRoutes;
