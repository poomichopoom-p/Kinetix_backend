import mongoose from "mongoose";

const deliveryUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["USER", "DRIVER", "ADMIN"], required: true },
  },
  { timestamps: true },
);

export const DeliveryUser = mongoose.model("DeliveryUser", deliveryUserSchema, "delivery_users");
