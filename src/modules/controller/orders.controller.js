import { Order } from "../Model/Orders-model.js";
import { User } from "../Model/user-model.js";
import { Products } from "../Model/products-model.js";
import { Cart } from "../Model/Cart.model.js";

// POST /api/orders

export const createOrder = async (req, res, next) => {
  try {
    const { items, rentalDays, totalRental, totalDeposit, grandTotal, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Calculate rental period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + rentalDays);

    const order = await Order.create({
      userId: req.user._id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        rentalDays: rentalDays,
        rentalFee: item.price * rentalDays * item.quantity,
        deposit: item.deposit,
      })),
      totalRental,
      totalDeposit,
      grandTotal,
      status: "pending",
      startDate,
      endDate,
      shippingAddress
    });

    // Update user's dashboard summary
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        "dashboardSummary.totalRentalsCount": 1,
        "dashboardSummary.totalSpent": grandTotal,
        memberPoints: Math.floor(grandTotal / 100)
      }
    });

    // Reduce product stock
    for (const item of items) {
      await Products.findOneAndUpdate(
        {
          _id: item.productId,
          "variants.size.size": item.size
        },
        {
          $inc: { "variants.$[].size.$[size].stock": -item.quantity }
        },
        {
          arrayFilters: [{ "size.size": item.size }]
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { orderId: order._id, grandTotal: order.grandTotal }
    });

  } catch (err) {
    next(err);
  }
};

// Get user's own orders (for user dashboard)
export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id });
  res.json({ success: true, data: orders });
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



// Get single order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

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