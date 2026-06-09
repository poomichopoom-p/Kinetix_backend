import { Router } from "express";
import { router as usersRouter } from "./user.router/users.router.js";
import { router as productsRouter } from "./product.router/product.router.js";
import { router as staffRouter } from "./staff.router/staff.router.js";
import { orderRouter as orderRouter } from "./order.router/order.router.js";
import { router as brandRouter } from "./brand.router/brand.router.js";
import { router as shoeRouter } from "./shoe.router/shoe.router.js";
import { router as categoryRouter } from "./category.router/category.router.js"; // New import
import { router as deliveryAuthRouter } from "./deliveryAuth.router/deliveryAuth.router.js";
import { router as jobRouter } from "./job.router/job.router.js";
import { router as rentalsRouter } from "./rentals.router/rentals.router.js";
import { router as cartRouter } from "./cart.router/cart.router.js";
import authUser from "../middleware/authUser.js";
import isAdmin from "../middleware/isAdmin.js";
import { adminRouter } from "./admin.router/admin.router.js";

export const router = Router();

router.use("/users", usersRouter);
router.use("/staff", isAdmin, staffRouter);
router.use("/products", productsRouter);
router.use("/products/admin", authUser, isAdmin, productsRouter);
router.use("/orders", authUser, isAdmin, orderRouter);
router.use("/shoes", shoeRouter);
router.use("/brands", brandRouter); // New route for brands
router.use("/categories", categoryRouter); // New route for categories
router.use("/cart", authUser, cartRouter);
router.use("/admin", adminRouter);


router.use("/rentals", authUser, rentalsRouter);
router.use("/payments", paymentRouter);

// Rewards routes
router.get("/rewards/points", authUser, getUserRewards);
router.post("/rewards/redeem", authUser, redeemPoints);

// ── Delivery & Return Management ───────────────────────────────────────────────
router.use("/delivery-auth", deliveryAuthRouter);
router.use("/jobs", jobRouter);
