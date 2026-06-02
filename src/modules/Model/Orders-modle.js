import mongoose from "mongoose";

import { priceSchema } from "./products-model";

const OrdersItem = new mongoose.Schema({
  ProductId: mongoose.Schema.type.ObjectId,
  ref: "Product",
  required: true,
  status: { type: Srting, required: true },
  rental_plan: { priceSchema },
  sku_color_code: { type: String, required: true, trim: true },
  deposit_amount: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  // costomerId:ObjectId(001),
  status: {
    type: Srting,
    required: true,
    enum: ["successful", "Waiting", "Fail", "Done"],
    default: "Waiting",
  },
  ordered_at: { type: Date, default: Date.now },
  delivery_date: { type: Date },
  item: { OrdersItem },
  suspended_at: { type: Date },
  rental_stat_at: { type: Date },
  canceled_at: { type: Date },
});
const Orders = mongoose.model("order", orderSchema);
