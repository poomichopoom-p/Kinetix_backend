import mongoose from "mongoose";
import { Payment } from "../Model/payment-model.js";

const PAYMENT_METHODS = ["card", "promptpay", "wallet"];

export const getPayments = async (req, res, next) => {
  try {
    const history = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalPaid = history
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const balance = 0;
    const outstanding = 0;

    return res.status(200).json({
      success: true,
      data: {
        balance,
        outstanding,
        methods: PAYMENT_METHODS,
        recentPayments: history.map((payment) => ({
          id: payment._id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          receiptUrl: payment.receiptUrl,
          createdAt: payment.createdAt,
        })),
        totalPaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const history = await Payment.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

export const getPaymentById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid payment ID" });
  }

  try {
    const payment = await Payment.findOne({ _id: id, userId: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req, res, next) => {
  const { amount, method, status, receiptUrl } = req.body || {};

  if (!amount || !method) {
    return res.status(400).json({
      success: false,
      message: "amount and method are required",
    });
  }

  if (!PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported payment method: ${method}`,
    });
  }

  try {
    const payment = await Payment.create({
      userId: req.user._id,
      amount,
      method,
      status: status || "completed",
      receiptUrl,
    });

    return res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const addPaymentMethod = async (req, res, next) => {
  const { method } = req.body || {};

  if (!method || !PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({
      success: false,
      message: "Valid payment method is required",
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      method,
      enabled: true,
      message: `${method} is available for this account`,
    },
  });
};
