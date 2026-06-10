import { Order } from "../Model/Orders-model.js";
<<<<<<< HEAD
//import { Cart } from "../Model/cart.model.js";
import { Products } from "../Model/products-model.js";

// POST /api/orders — create order from current cart
=======
import { Cart } from "../Model/Cart.model.js";
import { Products } from "../Model/products-model.js";

/**
 * POST /api/orders
 * Generates an order, securely executes multi-layer array variant stock reductions, 
 * and wipes the active checkout cart session clean.
 */
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
export const createOrder = async (req, res) => {
  try {
    const { items, totalRental, totalDeposit, grandTotal } = req.body;

    if (!items?.length) {
<<<<<<< HEAD
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });
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
    await Products.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], updatedAt: new Date() },
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot place order" });
  }
};

// GET /api/orders — get all orders for current user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Get orders error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot load orders" });
  }
};

// GET /api/orders/:orderId — get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id, // ensure user can only see their own orders
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot load order" });
=======
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
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
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
<<<<<<< HEAD
    const prebookings = await Orders.find({
      customerId: req.user._id,
      is_active: true,
      status: "Waiting",
    });

    return res.status(200).json({
      success: true,
      message: "Get prebooking rentals successful",
      data: prebookings,
    });
  } catch (err) {
    next(err);
  }
};

export const getRentalTracking = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid rental ID" });
  }

  try {
    const order = await Orders.findOne({
      _id: id,
      customerId: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
=======
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id, // Data Isolation: Blocks access to other users' data modifications
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Target rental receipt could not be resolved." });
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
<<<<<<< HEAD
    next(err);
  }
};

<<<<<<< HEAD

=======
>>>>>>> aeb98efb8fa449be3b1d329e8cf92bce610fd3ba
export const getRentalHistory = async (req, res, next) => {
  try {
    const { q, brand, page = 1, limit = 5 } = req.query;
    const query = {
      customerId: req.user._id,
      status: { $in: ["Done", "successful", "Fail"] },
    };

    if (q) {
      // Note: This is a simplified search. In a real app, you might join with Products
      // but here we just check if it matches some mock criteria or simplified fields.
      // For now, let's keep it simple.
    }

    if (brand && brand !== "All") {
      // query["item.brand"] = brand; // Needs model update if brand is stored in order item
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Orders.countDocuments(query);
    const orders = await Orders.find(query)
      .populate("item.ProductId")
      .sort({ ordered_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map to the format frontend expects
    const formattedData = orders.map((o) => ({
      brand: o.item.ProductId?.brand || "Unknown",
      model: o.item.ProductId?.modelName || "Unknown Shoe",
      size: o.item.ProductId?.variants?.[0]?.size?.[0]?.size || 42,
      dateRange: `${new Date(o.ordered_at).toLocaleDateString()} - ${new Date(o.delivery_date).toLocaleDateString()}`,
      days: 7,
      price: o.item.deposit_amount || 0,
      status: o.status === "Done" ? "Returned" : o.status,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      total,
      page: parseInt(page),
    });
  } catch (err) {
    next(err);
  }
};
<<<<<<< HEAD
=======

export const exportRentalHistory = async (req, res, next) => {
  try {
    const orders = await Orders.find({ customerId: req.user._id })
      .populate("item.ProductId")
      .sort({ ordered_at: -1 });

    let csv = "Brand,Model,Size,Date,Price,Status\n";
    orders.forEach((o) => {
      const brand = o.item.ProductId?.brand || "Unknown";
      const model = o.item.ProductId?.modelName || "Unknown Shoe";
      const date = new Date(o.ordered_at).toLocaleDateString();
      const price = o.item.deposit_amount || 0;
      const status = o.status;
      csv += `${brand},${model},42,${date},${price},${status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rental-history.csv"',
    );
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
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
=======
    console.error("Get receipt breakdown query error:", err);
    return res.status(500).json({ success: false, message: "Could not retrieve targeted order documentation snapshot details." });
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
  }
};
>>>>>>> aeb98efb8fa449be3b1d329e8cf92bce610fd3ba
