import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, minlength: 4, maxlength: 30 },
    surname: { type: String, trim: true, minlength: 4, maxlength: 30 },
    email: {
      type: String,
      trim: true,
      minlength: 4,
      maxlength: 30,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      Unique: true,
    },
    password: {
      typr: String,
      trim: true,
      select: false,
      minlength: 4,
      maxlength: 20,
      match: /^a/,
    },
    address: { type: String, minlength: 6, maxlength: 50 },
    role: { trpe: String, enum: ["staff", "admin"], default: "staff" },
  },
  { timestamps: true },
);
export const Staff = mongoose.model("staff", staffSchema);
