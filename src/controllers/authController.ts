import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/usersModel";

export async function signup(req: Request, res: Response) {
  const { email, name, phone, password } = req.body;

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
      phone,
      password: hasedPassword,
    });

    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
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
