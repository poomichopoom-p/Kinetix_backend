import { Order } from "../Model/Orders-model.js";
//import { Cart } from "../Model/cart.model.js";
import { Products } from "../Model/products-model.js";

// POST /api/orders — create order from current cart
export const createOrder = async (req, res) => {
  try {
    const { items, totalRental, totalDeposit, grandTotal } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalRental,
      totalDeposit,
      grandTotal,
    });

    // Clear user's cart after order placed
    //await Cart.findOneAndUpdate(
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], updatedAt: new Date() }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });

  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ success: false, message: "Cannot place order" });
  }
};

// GET /api/orders — get all orders for current user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ success: false, message: "Cannot load orders" });
  }
};

// GET /api/orders/:orderId — get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,   // ensure user can only see their own orders
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ success: false, message: "Cannot load order" });
  }
};

