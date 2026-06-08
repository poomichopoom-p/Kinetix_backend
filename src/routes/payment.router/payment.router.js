import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import {
  getPayments,
  getPaymentHistory,
  getPaymentById,
  createPayment,
  addPaymentMethod,
} from "../../modules/controller/payment.controller.js";

export const router = Router();
router.use(authUser);

router.get("/", getPayments);
router.get("/history", getPaymentHistory);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.post("/method", addPaymentMethod);
