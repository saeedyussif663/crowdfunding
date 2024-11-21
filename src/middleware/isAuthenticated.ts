import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";

interface UserPayload {
  userId: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

dotenv.config();
const accesstoken_secret = process.env.ACCESS_TOKEN_SECRET as string;

export default function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorize" });
    return;
  }

  try {
    const user = jwt.verify(token, accesstoken_secret);
    req.user = user as UserPayload;
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    res.status(500).json({ message: "An error occured" });
    return;
  }

  next();
}
