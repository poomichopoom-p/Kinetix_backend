import { Router } from "express";

import {
  getOrder,
  newOrder,
  deleteOrder,
  getUserOrders,
  getActiveRentals,
  getPrebooking,
  getRentalTracking,
  getOrderById,
  updateShippingStatus,
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

// GET /api/orders/:id
router.get("/:id", authUser, getOrderById);

// PATCH /api/orders/:id/shipping-status
router.patch("/:id/shipping-status", authUser, isAdmin, updateShippingStatus);

// DELETE /api/order/:id
router.delete("/:id", authUser, isAdmin, deleteOrder);
