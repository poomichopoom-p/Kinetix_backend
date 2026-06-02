import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema({
  skuColorCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true,
  },
  colorName: { type: String, required: true },
  images: { type: String },
  size: [sizeSchema],
});
export const priceSchema = new mongoose.Schema({
  "1day": { type: Number, require: true },
  "3day": { type: Number, require: true },
  "7day": { type: Number, require: true },
});
const ProductsSchema = new mongoose.Schema(
  {
    modleName: { type: String, required: true, minlength: 5 },
    description: { type: String },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Road", "Trail", "Daily trainer"],
    },
    price: [priceSchema],
    variants: [variantSchema],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now ,select:false},
  },
  { timestamps: true },
);

export const Products = mongoose.model("Product", ProductsSchema);
