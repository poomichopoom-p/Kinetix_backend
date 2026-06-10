import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["card", "promptpay", "wallet"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    receiptUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
