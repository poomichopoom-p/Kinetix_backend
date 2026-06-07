import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      select: false,
      minlength: 4,
      maxlength: 100,
    },
    address: { type: String, minlength: 6, maxlength: 50 },
    role: {
      trpe: String,
      enum: ["staff", "admin"],
      // default: "staff",
    },
  },
  { timestamps: true },
);

staffSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const Staff = mongoose.model("Staff", staffSchema);
