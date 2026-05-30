import mongoose from "mongoose";

// const productsSchema = new mongoose.Schema({
//   name: { type: String, trim: true, maxlength: 30, minlength: 5 },
//   model: { type: String, minlength: 3, maxlength: 20 },
//   SKU: { type: String, Unique: true, trim: true, uppercase: true },
//   price: { type: Number, trim: true },
//   brand: { type: String, minlength: 4 },
//   size: { type: Number, trim: true },
//   color: { type: String, minlength: 3, maxlength: 26, trim: true },
//   category: {
//     trpe: String,
//     minlength: 3,
//     maxlength: 15,
//     trim: true,
//     enum: ["men", "women", "unisex"],
//   },
// });

const sizeSchema = new mongoose.Schema(
  {
    sizeEU: { type: Number, required: true },
    sizeUS: { type: Number, required: true },
    sizeUK: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema({
  skuColorCode: { type: String, required: true, uppercase: true, trim: true },
  colorName: { type: String, required: true },
  images: { type: String },
  size: [sizeSchema],
});

const ProductsSchema = new mongoose.Schema(
  {
    Modelname: { type: String, required: true, minlength: 5 },
    description: { type: String },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex"],
    },
    price: { type: Number, require: true },
    variants: [variantSchema],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Products = mongoose.model("Product", ProductsSchema);
