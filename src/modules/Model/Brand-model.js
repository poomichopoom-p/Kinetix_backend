import mongoose, { model, modelNames } from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      minlength: 3,
      require: true,
      unique: true,
      trim: true,
    },
    model: [
      {
        type: Map,
        of: String,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
// module.exports = mongoose.model("Brand",brandSchema);
export const Brand = mongoose.model("Brand", brandSchema);
