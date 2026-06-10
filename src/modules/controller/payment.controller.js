import { Order } from "../Model/Orders-model.js";

// POST /api/order/:orderId/pay  — mock payment, no real gateway
export const mockPayment = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Order already processed" });
    }

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1000));

    // Mock: 90% success rate (or always succeed — change to true for demo)
    const paymentSuccess = true;

    if (!paymentSuccess) {
      return res.status(402).json({ success: false, message: "Payment declined (mock)" });
    }

    order.status = "confirmed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      transactionId: `TXN-${Date.now()}`,
      orderId: order._id,
      amount: order.grandTotal,
    });
  } catch (err) {
    console.error("Payment error:", err);
    return res.status(500).json({ success: false, message: "Payment failed" });
  }
};