import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/.+@.+\..+/, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^0[0-9]{9}$/, "Phone number is invalid"],
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
