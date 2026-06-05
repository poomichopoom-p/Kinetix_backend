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
const { trackingNumber, item} = req.body || {};  

if( !trackingNumber || !item){
return res.status(401).json({
    success: false,
    message: "Create order API is not implemented yet",
  });
}

try{
 const doc = await Orders.create(
  {
    trackingNumber,
    item
  }
 )
}catch(err){
  next(err)
}
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Orders.find({
      customerId: req.user._id,
      is_active: true,
    });

    return res.status(200).json({
      success: true,
      message: "Get user orders successful",
      data: orders,
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
  }
   catch (err) {
    next(err);}
    
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