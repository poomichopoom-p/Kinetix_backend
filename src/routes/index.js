import { Router } from "express";
import { router as usersRouter } from "./user.router/users.routes.js";
import { router as productsRouter } from "./product.router/product.router.js";
import { router as staffRouter } from "./staff.router/staff.router.js";
import { router as orderRouter } from "./order.router/order.router.js";
import { router as rentalsRouter } from "./rentals.router/rentals.router.js";
import { router as paymentRouter } from "./payment.router/payment.router.js";
import { router as shoeRouter } from "./shoe.router/shoe.router.js";
import { router as deliveryAuthRouter } from "./deliveryAuth.router/deliveryAuth.router.js";
import { router as jobRouter } from "./job.router/job.router.js";
import {router as cartRouter } from "./cart.routes/cart-router.js"
import authUser from "../middleware/authUser.js";

export const router = Router();

router.use("/users", usersRouter);
router.use("/staff", staffRouter);
router.use("/products", productsRouter);
router.use("/order", authUser, orderRouter);
router.use("/rentals", authUser, rentalsRouter);
router.use("/payments", paymentRouter);
// router.use("/shoes", shoeRouter);
router.use("/cart", cartRouter);

// ── Delivery & Return Management ───────────────────────────────────────────────
router.use("/delivery-auth", deliveryAuthRouter);
router.use("/jobs", jobRouter);
