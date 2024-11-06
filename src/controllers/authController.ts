import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/usersModel";
import sendEmail from "../lib/sendEmail";

dotenv.config();
const accesstoken_secret = process.env.ACCESS_TOKEN_SECRET as string;
const accesstoken_duration = process.env.ACCESS_TOKEN_DURATION;
const refreshtoken_secret = process.env.REFRESH_TOKEN_SECRET as string;
const refreshtoken_duration = process.env.REFRESH_TOKEN_DURATION;
const resettoken_secret = process.env.RESET_PASSWORD_SECRET as string;
const resettoken_duration = process.env.RESET_PASSWORD_DURATION;

export async function signup(req: Request, res: Response) {
  const { email, name, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(422).json({ message: "A user with the email already exists" });
    return;
  }

  if (!password) {
    res.status(422).json({ message: "Password is required" });
    return;
  }

  const hasedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({
      name,
      email,
      password: hasedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    });

    sendEmail(newUser.name, newUser.email);

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

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ message: "Email and Password are required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = jwt.sign({ userId: user._id }, accesstoken_secret, {
    expiresIn: accesstoken_duration,
  });
  const refreshToken = jwt.sign({ userId: user._id }, refreshtoken_secret, {
    expiresIn: refreshtoken_duration,
  });

  res.status(200).json({
    user: { email: user.email, name: user.name },
    accessToken,
    refreshToken,
  });
  return;
}

export function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(422).json({ message: "Refresh token is required" });
    return;
  }

  try {
    const user = jwt.verify(refreshToken, refreshtoken_secret) as JwtPayload;

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      accesstoken_secret,
      {
        expiresIn: accesstoken_duration,
      }
    );
    const newRefreshToken = jwt.sign(
      { userId: user.userId },
      refreshtoken_secret,
      {
        expiresIn: refreshtoken_duration,
      }
    );

    res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    return;
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
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    res.status(422).json({ message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, resettoken_secret, {
    expiresIn: resettoken_duration,
  });

  res.status(200).json({ token });
  return;
}

export async function setPassword(req: Request, res: Response) {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password) {
    res.status(422).json({ message: "Token and passwod required" });
    return;
  }

  if (!(password === confirmPassword)) {
    res.status(422).json({ message: "Passwords don't match" });
    return;
  }

  try {
    const isTokenValid = jwt.verify(token, resettoken_secret) as JwtPayload;
    const hasedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      isTokenValid.userId,
      {
        password: hasedPassword,
      },
      { runValidators: true }
    );

    res.status(200).json({ message: "Password reset successfully" });
    return;
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
}
