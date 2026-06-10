import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },  // daily price
  size: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  rentalDays: { type: Number, required: true },
  rentalFee: { type: Number, required: true },  // price × days × qty
  deposit: { type: Number, required: true },
  // Track individual item rental status
  rentalStatus: {
    type: String,
    enum: ["pending", "active", "returned"],
    default: "pending"
  },
  returnedAt: { type: Date },
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
      enum: ["pending", "confirmed", "active", "rented", "shipped", "returned", "completed", "cancelled"],
      default: "pending",
    },

    startDate: { type: Date },
    endDate: { type: Date },
    actualReturnDate: { type: Date },

    shippingAddress: {
      recipientName: { type: String },
      phone: { type: String },
      addressLine1: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Thailand" },
    },

    trackingNumber: { type: String },  // For external delivery
    isLate: { type: Boolean, default: false },
    lateFee: { type: Number, default: 0 },

  },
  { timestamps: true }
);


orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);