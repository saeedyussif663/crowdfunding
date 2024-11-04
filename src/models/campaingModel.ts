import { Schema, model } from "mongoose";

const campaignsSchema = new Schema(
  {
    title: { type: String, required: [true, "title is required"] },
    description: { type: String, required: [true, "description is required"] },
    amountExpected: {
      type: Number,
      required: [true, "amount expected is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Campaign image URL is required"],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Campaign creator is required"],
    },
    contributors: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

const Campaign = model("Campaign", campaignsSchema);

export default Campaign;
