import { Router } from "express";
import {
  getActiveRentals,
  getPrebooking,
  getRentalTracking,
} from "../../modules/controller/orders.controller.js";

export const router = Router();

router.get("/active", getActiveRentals);
router.get("/prebooking", getPrebooking);
router.get("/:id/tracking", getRentalTracking);
