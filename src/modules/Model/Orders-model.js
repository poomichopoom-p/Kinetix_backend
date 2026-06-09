import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },  // daily price
  size: { type: String },
  quantity: { type: Number, default: 1 },
  rentalDays: { type: Number, required: true },
  rentalFee: { type: Number, required: true },  // price × days × qty
  deposit: { type: Number, required: true },  // price × multiplier × qty
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalRental: { type: Number, required: true },
    totalDeposit: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "returned", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

/*import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
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
  { _id: false }
);

const OrdersItem = new mongoose.Schema({
  ProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  status: { type: String, required: true },
  rental_plan: rentalSchema,
  sku_color_code: { type: String, required: true, trim: true },
  deposit_amount: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingStatus: {
    type: String,
    enum: ["preparing", "shipped", "delivered", "returning", "Waiting", "successful", "Fail", "Done"],
    default: "preparing",
  },
  trackingNumber: { type: String, trim: true },
  estimatedDelivery: { type: Date },
  status: {
    type: String,
    required: true,
    enum: ["successful", "Waiting", "Fail", "Done"],
    default: "Waiting",
  },
  ordered_at: { type: Date, default: Date.now },
  delivery_shipping_date: { type: Date },
  delivery_confirm_date: { type: Date },
  delivery_date: { type: Date },
  item: OrdersItem,
  suspended_at: { type: Date },
  rental_stat_at: { type: Date },
  canceled_at: { type: Date },
  // soft delete flag — false means the order is deactivated, not physically removed
  is_active: { type: Boolean, default: true },
});

export const Orders = mongoose.model("order", orderSchema);
*/