import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, minlength: 3, maxlength: 30 },
  surname: { type: String, trim: true, minlength: 3, maxlength: 30 },
  email: {
    type: String,
    trim: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, trim: true, minlength: 8, select: false },
  address: { type: String, minlength: 10, select: true },
  userRank: {
    type: String,
    enum: ["bronze", "gold", "silver", "platinum", "Diamond"],
    default: "bronze",
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = mongoose.model("User", userSchema);
