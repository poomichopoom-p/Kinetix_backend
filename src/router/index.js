import { Router } from "express";
import { router as usersRouter } from "./user.router/users.router.js";
import { router as productsRouter } from "./product.router/product.router.js";
import { router as staffRouter } from "./staff.router/staff.router.js";
import { orderRouter as orderRouter } from "./order.router/order.router.js";
import { router as brandRouter } from "./brand.router/brand.router.js";
import { router as shoeRouter } from "./shoe.router/shoe.router.js";
<<<<<<< HEAD
import { router as categoryRouter } from "./category.router/category.router.js"; // New import
import { router as deliveryAuthRouter } from "./deliveryAuth.router/deliveryAuth.router.js";
import { router as jobRouter } from "./job.router/job.router.js";
import { router as rentalsRouter } from "./rentals.router/rentals.router.js";
import { router as paymentRouter } from "./payment.router/payment.router.js";
import { router as cartRouter } from "./cart.router/cart-router.js";
import authUser from "../middleware/authUser.js";
import isAdmin from "../middleware/isAdmin.js";
import { adminRouter } from "./admin.router/admin.router.js";
import { getUserRewards, redeemPoints } from "../modules/controller/user.controller.js";
=======
import { router as categoryRouter } from "./category.router/category.router.js"
//import { router as jobRouter } from "./job.router/job.router.js";
import { router as cartRouter } from "./cart.router/cart.router.js"
import authUser from "../middleware/authUser.js";
import isAdmin from "../middleware/isAdmin.js";
import { adminRouter } from "./admin.router/admin.router.js";
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a


export const router = Router();

router.use("/users", usersRouter);
//router.use("/staff", isAdmin, staffRouter);
router.use("/staff", staffRouter);
router.use("/products", productsRouter);
router.use("/products/admin", authUser, isAdmin, productsRouter);
<<<<<<< HEAD
router.use("/orders", authUser, isAdmin, orderRouter);
router.use("/shoes", shoeRouter);
router.use("/brands", brandRouter); // New route for brands
router.use("/categories", categoryRouter); // New route for categories
=======
router.use("/order", authUser, /*isAdmin,*/ orderRouter);
router.use("/order", authUser, isAdmin, orderRouter);
router.use("/shoes", shoeRouter);
router.use("/brands", brandRouter);
router.use("/categories", categoryRouter);
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
router.use("/cart", authUser, cartRouter);
router.use("/admin", adminRouter);

// ── Delivery & Return Management ───────────────────────────────────────────────
//router.use("/delivery-auth", deliveryAuthRouter);
//router.use("/jobs", jobRouter);
