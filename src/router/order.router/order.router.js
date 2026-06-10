import { Router } from "express";
import { createOrder, getUserOrders, getOrderById } from "../../modules/controller/orders.controller.js";
<<<<<<< HEAD
=======
import { mockPayment } from "../../modules/controller/payment.controller.js";
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
import authUser from "../../middleware/authUser.js";

export const orderRouter = Router();

orderRouter.post("/", authUser, createOrder);
orderRouter.get("/", authUser, getUserOrders);
orderRouter.get("/:orderId", authUser, getOrderById);

// Mock payment
<<<<<<< HEAD
//orderRouter.post("/:orderId/pay", mockPayment);
=======
orderRouter.post("/:orderId/pay", mockPayment);
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
