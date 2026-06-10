import { Router } from "express";
import { createOrder, getUserOrders, getOrderById } from "../../modules/controller/orders.controller.js";
import { mockPayment } from "../../modules/controller/payment.controller.js";
import authUser from "../../middleware/authUser.js";

export const orderRouter = Router();

orderRouter.post("/", authUser, createOrder);
orderRouter.get("/", authUser, getUserOrders);
orderRouter.get("/:orderId", authUser, getOrderById);

// Mock payment
orderRouter.post("/:orderId/pay", mockPayment);