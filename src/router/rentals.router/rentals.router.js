import { Router } from "express";
import {
  getActiveRentals,
  getPrebooking,
  getRentalTracking,
  getRentalHistory,
  exportRentalHistory,
} from "../../modules/controller/orders.controller.js";

export const router = Router();

router.get("/active", getActiveRentals);
router.get("/history", getRentalHistory);
router.get("/history/export", exportRentalHistory);
router.get("/prebooking", getPrebooking);
router.get("/:id/tracking", getRentalTracking);
