import { Router } from "express";
import { router as usersRouter } from "./user.router/users.routes.js";
import { router as productsRouter } from "./product.router/product.router.js";
import { router as staffRouter } from "./staff.router/staff.router.js";
import { router as orderRouter } from "./order.router/order.router.js";
import { router as rentalsRouter } from "./rentals.router/rentals.router.js";
import { router as paymentRouter } from "./payment.router/payment.router.js";
import { router as deliveryAuthRouter } from "./deliveryAuth.router/deliveryAuth.router.js";
import { router as jobRouter } from "./job.router/job.router.js";
import { router as cartRouter } from "./cart.routes/cart-router.js"
import { router as wishlistRouter } from "./wishlist.routes/wishlist.router.js"
import { router as notificationRouter } from "./notification.router/notification.router.js"
import authUser from "../middleware/authUser.js";
import { getUserRewards, redeemPoints } from "../modules/controller/user.controller.js";

export const router = Router();

router.use("/users", usersRouter);
router.use("/staff", staffRouter);
router.use("/products", productsRouter);
router.use("/orders", authUser, orderRouter);
router.use("/rentals", authUser, rentalsRouter);
router.use("/payments", paymentRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", authUser, wishlistRouter);
router.use("/notifications", authUser, notificationRouter);

// Rewards routes
router.get("/rewards/points", authUser, getUserRewards);
router.post("/rewards/redeem", authUser, redeemPoints);

// ── Delivery & Return Management ───────────────────────────────────────────────
router.use("/delivery-auth", deliveryAuthRouter);
router.use("/jobs", jobRouter);
