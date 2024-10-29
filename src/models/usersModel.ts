import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
