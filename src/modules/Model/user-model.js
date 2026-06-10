import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, minlength: 3, maxlength: 30 },
    surname: { type: String, trim: true, minlength: 3, maxlength: 30 },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    cart: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },

        skuColorCode: {
          type: String,
          required: true,
        },

        size: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        role: {
          type: String,
          enum: ["user", "admin"],
          default: "user"
        },
      },
    ],
    password: { type: String, trim: true, minlength: 8, select: false },
    address: { type: String, minlength: 10, select: true },
    role: { type: String, trim: true, enum: ["user", "admin"], default: "user" },
    userRank: {
      type: String,
      enum: ["bronze", "gold", "silver", "platinum", "Diamond"],
      default: "bronze",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = mongoose.model("User", userSchema);
