import mongoose from "mongoose";
import { Orders } from "../Model/Orders-model.js";

export const getOrder = async (req, res, next) => {
  try {
    const doc = await Orders.find();
    if (!doc) {
      return res
        .status(404)
        .json({ success: true, message: "Order not found!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Get orders successful!", data: doc });
  } catch (err) {
    next(err);
  }
};

export const newOrder = async (req, res, next) => {
  try {
    const { items, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add items to your order"
      });
    }

    const newOreder = await Orders.create({
      items: items,
      status: "waiting",
      ordered_at: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Order created",
      data: newOrder
    });
  } catch (err) {
    console.log("Error: Create order failed", err);
    return res.status(500).json({
      success: false,
      message: "Cannot create order. Please try again."
    });
  }
};

// DELETE /api/order/:id — Soft Delete (sets is_active: false, never removes the document)
export const deleteOrder = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    const deactivated = await Orders.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!deactivated) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    return res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
};
