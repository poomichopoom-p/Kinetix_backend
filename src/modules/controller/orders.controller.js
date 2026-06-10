import { Order } from "../Model/Orders-model.js";
import { Cart } from "../Model/Cart.model.js";
import { Products } from "../Model/products-model.js";

/**
 * POST /api/orders
 * Generates an order, securely executes multi-layer array variant stock reductions, 
 * and wipes the active checkout cart session clean.
 */
export const createOrder = async (req, res) => {
  try {
    const { items, totalRental, totalDeposit, grandTotal } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: "No items found in your order request." });
    }

    // 1. Atomically verify stock levels and deduct quantities sequentially
    for (const item of items) {
      const parsedSize = isNaN(item.size) ? item.size : Number(item.size);

      const stockUpdate = await Products.updateOne(
        {
          _id: item.productId,
          "variants.size.size": parsedSize,
          "variants.size.stock": { $gte: item.quantity } // Safeguard: Block over-allocation / negative limits
        },
        {
          // $[v] matches variant block array condition, $[s] handles exact target size array element block
          $inc: { "variants.$[v].size.$[s].stock": -item.quantity },
        },
        {
          arrayFilters: [
            { "v.size.size": parsedSize },
            { "s.size": parsedSize }
          ]
        }
      );

      // Handle stock execution failure safely
      if (stockUpdate.matchedCount === 0) {
        return res.status(400).json({
          success: false,
          message: `Item "${item.name}" (Size ${item.size}) is out of stock or allocation limits reached.`
        });
      }
    }

    // 2. Persist the absolute immutable checkout snapshot to Database
    const order = await Order.create({
      userId: req.user._id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        size: String(item.size),
        quantity: Number(item.quantity || 1),
        rentalDays: Number(item.rentalDays),
        rentalFee: Number(item.rentalFee),
        deposit: Number(item.deposit)
      })),
      totalRental: Number(totalRental),
      totalDeposit: Number(totalDeposit),
      grandTotal: Number(grandTotal),
      status: "confirmed" // Explicitly auto-confirming following successful client mock processing countdown
    });

    // 3. Clear active items out of user session cart cleanly
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], updatedAt: new Date() }
    );

    return res.status(201).json({
      success: true,
      message: "Order finalized and placed successfully.",
      orderId: order._id,
    });

  } catch (err) {
    console.error("Create order handler exception error:", err);
    return res.status(500).json({ success: false, message: "Internal server processing failure while generating order." });
  }
};

/**
 * GET /api/orders
 * Fetches all persistent chronological transactions matching current authenticated token context.
 */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Get user history exception error:", err);
    return res.status(500).json({ success: false, message: "Could not safely fetch individual payment transaction logs." });
  }
};

/**
 * GET /api/orders/:orderId
 * Fetches explicit transaction payloads scoped cleanly using authenticated route privacy layers.
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id, // Data Isolation: Blocks access to other users' data modifications
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Target rental receipt could not be resolved." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("Get receipt breakdown query error:", err);
    return res.status(500).json({ success: false, message: "Could not retrieve targeted order documentation snapshot details." });
  }
};