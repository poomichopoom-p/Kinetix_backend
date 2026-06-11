import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userType", required: true, index: true },
    userType: { type: String, enum: ["User", "DeliveryUser"], default: "DeliveryUser" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema, "notifications");
