import { Router } from "express";
import { createOrder, getUserOrders, getOrderById } from "../../modules/controller/orders.controller.js";
import authUser from "../../middleware/authUser.js";

export const orderRouter = Router();

orderRouter.post("/", authUser, createOrder);
orderRouter.get("/", authUser, getUserOrders);
orderRouter.get("/:orderId", authUser, getOrderById);

/*import { Router } from "express";

import {
  getOrder,
  newOrder,
  deleteOrder,
  getUserOrders,
  getActiveRentals,
  getPrebooking,
  getRentalTracking,
} from "../../modules/controller/orders.controller.js";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";

export const router = Router();
// get all order
router.get("/", getOrder);
router.get("/my", getUserOrders);
router.get("/active", getActiveRentals);
router.get("/prebooking", getPrebooking);
router.get("/:id/tracking", getRentalTracking);

router.post("/create-order", authUser, newOrder);

/*DELETE /api/order/:id
router.delete("/:id", authUser, isAdmin, deleteOrder);*/