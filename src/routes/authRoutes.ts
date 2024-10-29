import { Router, Response, Request } from "express";
import { signup } from "../controllers/authController";

const authRoutes = Router();

// signup
authRoutes.post("/sign-up", signup);

export default authRoutes;
