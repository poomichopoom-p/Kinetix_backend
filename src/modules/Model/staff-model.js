import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, minlength: 4, maxlength: 100 },
    surname: { type: String, trim: true, minlength: 4, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      minlength: 4,
      maxlength: 100,
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
    address: { type: String, minlength: 6, maxlength: 200 },
    role: {
      type: String,
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
