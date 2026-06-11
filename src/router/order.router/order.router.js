import { Router } from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} from "../../modules/controller/orders.controller.js";
import { mockPayment } from "../../modules/controller/payment.controller.js";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";


export const orderRouter = Router();

orderRouter.get("/test", (req, res) => {
    res.json({ success: true, message: "Order router working!" });
});

// 1. Checkout & Transaction Logs (User Scoped)
orderRouter.post("/", authUser, createOrder);
orderRouter.get("/", authUser, getUserOrders);
orderRouter.get("/:orderId", authUser, getOrderById);

// 2. Transaction Processing Payment Mock Gateway
orderRouter.post("/:orderId/pay", authUser, mockPayment);

// 3. Administrative Order Lifecycle Management
orderRouter.put("/:orderId/status", authUser, isAdmin, updateOrderStatus);
//orderRouter.post("/:orderId/pay", mockPayment);

