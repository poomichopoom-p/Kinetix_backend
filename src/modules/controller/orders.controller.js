import mongoose from "mongoose";
import { Order } from "../Model/Orders-model.js";
import { User } from "../Model/user-model.js";
import { Products } from "../Model/products-model.js";
import { Cart } from "../Model/Cart.model.js";

export const createOrder = async (req, res, next) => {
  const { items, rentalDays, totalRental, totalDeposit, grandTotal, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items in order" });
  }
  if (!rentalDays || rentalDays < 1) {
    return res.status(400).json({ success: false, message: "Invalid rental days" });
  }
  if (!grandTotal || grandTotal <= 0) {
    return res.status(400).json({ success: false, message: "Invalid grand total" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + rentalDays);

    const [order] = await Order.create([{
      userId: req.user._id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        rentalDays,
        rentalFee: item.price * rentalDays * item.quantity,
        deposit: item.deposit,
      })),
      totalRental,
      totalDeposit,
      grandTotal,
      status: "pending",
      startDate,
      endDate,
      shippingAddress: {
        recipientName: shippingAddress?.recipientName || req.user?.name,
        phone: shippingAddress?.phone,
        addressLine1: shippingAddress?.addressLine1 || shippingAddress?.street,
        city: shippingAddress?.city,
        province: shippingAddress?.province || shippingAddress?.state,
        postalCode: shippingAddress?.postalCode || shippingAddress?.zip,
        country: shippingAddress?.country || "Thailand",
      },
    }], { session });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        "dashboardSummary.totalRentalsCount": 1,
        "dashboardSummary.totalSpent": grandTotal,
        memberPoints: Math.floor(grandTotal / 100),
      },
    }, { session });

    for (const item of items) {
      const product = await Products.findOne({ _id: item.productId }).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      let stockUpdated = false;
      for (const variant of product.variants) {
        const sizeEntry = variant.size.find(s => String(s.size) === String(item.size));
        if (sizeEntry) {
          if (sizeEntry.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.modelName} size ${item.size}`);
          }
          sizeEntry.stock -= item.quantity;
          stockUpdated = true;
          break;
        }
      }

      if (!stockUpdated) {
        throw new Error(`Size ${item.size} not found for product ${product.modelName}`);
      }

      await product.save({ validateBeforeSave: false, session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { orderId: order._id, grandTotal: order.grandTotal },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Create order error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Cannot place order",
    });
  } finally {
    session.endSession();
  }
};

export const getUserOrders = async (req, res, next) => {
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
  }
};

export const getActiveRentals = async (req, res, next) => {
  try {
    const activeOrders = await Orders.find({
      customerId: req.user._id,
      is_active: true,
      status: { $nin: ["Done", "Fail"] },
    });

    return res.status(200).json({
      success: true,
      message: "Get active rentals successful",
      data: activeOrders,
    });
  } catch (err) {
    next(err);
  }
};

export const getPrebooking = async (req, res, next) => {
  try {
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
    return res.status(400).json({ success: false, message: "Invalid rental ID" });
  }

  try {
    const order = await Orders.findOne({
      _id: id,
      customerId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        shippingStatus: order.shippingStatus,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        status: order.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/*export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};
*/


// ADMIN: Update order status (mark as shipped, active, returned)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const { orderId } = req.params;

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    // If marking as active (rental started)
    if (status === "active" || status === "rented") {
      updateData.startDate = new Date();

      // Update user's currently renting count
      const order = await Order.findById(orderId);
      if (order) {
        await User.findByIdAndUpdate(order.userId, {
          $inc: { "dashboardSummary.currentlyRentingCount": 1 }
        });
      }
    }

    // If marking as returned
    if (status === "returned") {
      updateData.actualReturnDate = new Date();

      // Update user's rental counts
      const order = await Order.findById(orderId);
      if (order) {
        await User.findByIdAndUpdate(order.userId, {
          $inc: {
            "dashboardSummary.currentlyRentingCount": -1,
            "dashboardSummary.returnedRentalsCount": 1
          }
        });

        // Check if late
        if (new Date() > order.endDate) {
          const daysLate = Math.ceil((new Date() - order.endDate) / (1000 * 60 * 60 * 24));
          updateData.isLate = true;
          updateData.lateFee = daysLate * 50; // 50 THB per day late fee
        }
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    next(err);
  }
};

// ADMIN: Get all orders (with filters)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (err) {
    next(err);
  }
};

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
    return res
      .status(400)
      .json({ success: false, message: "Invalid order ID" });
  }

  try {
    const deactivated = await Orders.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );

    if (!deactivated) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);

    console.error("Get receipt breakdown query error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message:
          "Could not retrieve targeted order documentation snapshot details.",
      });
  }
};
