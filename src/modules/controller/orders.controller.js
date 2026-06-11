import mongoose from "mongoose";
import { Orders } from "../Model/Orders-model.js";
import { User } from "../Model/users-model.js";
import { Products } from "../Model/products-model.js";
import { getRankForPoints } from "../../utils/rank.js";
import notificationService from "../services/notificationService.js";

export const getOrder = async (req, res, next) => {
  try {
    const doc = await Orders.find();
    if (!doc) {
      return res
        .status(500)
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
    const { items, totalRental, totalDeposit, grandTotal } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    const order = await Orders.create({
      customerId: req.user._id,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity || 1,
        rentalDays: item.rentalDays,
        rentalFee: item.rentalFee,
        deposit: item.deposit,
      })),
      totalRental,
      totalDeposit,
      grandTotal,
      status: "successful",
    });

    // Empty the cart now that its items have been turned into an order
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    // Award reward points for the successful rental: every 25 THB of rental fee = 1 point
    const earnedPoints = Math.floor((totalRental || 0) / 25);
    if (earnedPoints > 0) {
      const user = await User.findById(req.user._id);
      user.points = (user.points || 0) + earnedPoints;
      user.userRank = getRankForPoints(user.points);
      await user.save();
    }

    // Notify the customer that their order is confirmed and awaiting next-day delivery
    notificationService
      .send({
        userId: order.customerId,
        userType: "User",
        title: "คำสั่งเช่าสำเร็จ",
        message: `หมายเลขออเดอร์ ${order._id} รอจัดส่งในวันถัดไป`,
      })
      .catch(() => {});

    // Record each item as an active rental so it shows up in the dashboard's
    // "Total Rentals" / "Active Rentals" stats and order history (rental_histories collection)
    const products = await Products.find({
      _id: { $in: items.map((item) => item.productId).filter(Boolean) },
    }).populate("brandId");
    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const now = new Date();
    const rentalHistories = items.map((item) => {
      const product = productById.get(String(item.productId));
      const planDays = item.rentalDays || 1;
      const endDate = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000);

      return {
        userId: req.user._id,
        orderId: order._id,
        status: "active",
        shoeSnapshot: {
          brand: product?.brandId?.brandName || "",
          modelName: item.name,
          imageUrl: item.image,
          size: item.size,
        },
        pricing: {
          rentalFee: item.rentalFee,
          deposit: item.deposit,
          lateDays: 0,
        },
        rentalPeriod: {
          startDate: now,
          endDate,
          planDays,
        },
        createdAt: now,
      };
    });

    if (rentalHistories.length > 0) {
      await mongoose.connection.db.collection("rental_histories").insertMany(rentalHistories);
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — fetch a single order belonging to the logged-in user
export const getOrderById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    const order = await Orders.findOne({ _id: id, customerId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/shipping-status — admin updates the shipping status
// of an order and notifies the customer
const SHIPPING_STATUS_MESSAGES = {
  preparing: "คำสั่งเช่าของคุณกำลังเตรียมจัดส่ง",
  shipped: "คำสั่งเช่าของคุณถูกจัดส่งแล้ว",
  delivered: "คำสั่งเช่าของคุณถูกจัดส่งสำเร็จแล้ว",
  returning: "คำสั่งเช่าของคุณกำลังอยู่ระหว่างการคืนสินค้า",
};

export const updateShippingStatus = async (req, res, next) => {
  const { id } = req.params;
  const { shippingStatus } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  const allowedStatuses = Orders.schema.path("shippingStatus").enumValues;
  if (!allowedStatuses.includes(shippingStatus)) {
    return res.status(400).json({ success: false, message: "Invalid shipping status" });
  }

  try {
    const order = await Orders.findByIdAndUpdate(
      id,
      { shippingStatus },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const message = SHIPPING_STATUS_MESSAGES[shippingStatus];
    if (message) {
      await notificationService.send({
        userId: order.customerId,
        userType: "User",
        title: "อัปเดตสถานะการจัดส่ง",
        message,
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// rental_histories.status -> the status values the dashboard groups by
// (ACTIVE_STATUSES = ["Waiting", "successful"], HISTORY_STATUSES = ["Done", "Fail"])
const RENTAL_STATUS_MAP = {
  active: "successful",
  reserved: "Waiting",
  late: "successful",
  returned: "Done",
  cancelled: "Fail",
};

export const getUserOrders = async (req, res, next) => {
  try {
    const histories = await mongoose.connection.db
      .collection("rental_histories")
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    const data = histories.map((h) => ({
      _id: h._id,
      status: RENTAL_STATUS_MAP[h.status] || h.status,
      createdAt: h.rentalPeriod?.startDate || h.createdAt,
      items: [
        {
          brand: h.shoeSnapshot?.brand || "",
          name: h.shoeSnapshot?.modelName || "",
          image: h.shoeSnapshot?.imageUrl || "",
          size: h.shoeSnapshot?.size,
          rentalFee: h.pricing?.rentalFee || 0,
          rentalDays: h.rentalPeriod?.planDays || 1,
        },
      ],
    }));

    return res.status(200).json({
      success: true,
      message: "Get user orders successful",
      data,
    });
  } catch (err) {
    next(err);
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