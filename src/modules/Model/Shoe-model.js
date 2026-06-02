import mongoose from "mongoose";

const shoeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    brand: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Shoe = mongoose.model("shoe", shoeSchema);
