import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    skuColorCode: { type: String, required: true },
    size: { type: Number },
    quantity: { type: Number, default: 1, min: 1 },
    rentalDays: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
});

export const Cart = mongoose.model("Cart", cartSchema);

