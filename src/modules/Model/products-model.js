import mongoose from "mongoose";




const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    skuColorCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },

    colorName: {
      type: String,
      required: true,
    },

    images: [{
      type: String,
      default: "",
    }],

    size: [sizeSchema],
  },
  { _id: false },
);

export const rentalSchema = new mongoose.Schema(
  {
    "1day": {
      type: Number,
      required: true,
    },

    "3day": {
      type: Number,
      required: true,
    },

    "7day": {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const ProductsSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

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

    rentalPlan: [rentalSchema],

    variants: [variantSchema],

    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: { type: Date, default: Date.now, select: false },
  },
  {
    timestamps: true,
  },
);

export const Products = mongoose.model("Product", ProductsSchema);

