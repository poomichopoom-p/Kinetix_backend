import { Router } from "express";
import { router as usersRouter } from "./user.router/users.routes.js";
import { router as productsRouter } from "./product.router/product.router.js";
//import { router as staffRouter } from "./staff.router/staff.router.js";
import { orderRouter as orderRouter } from "./order.router/order.router.js";
//import { router as shoeRouter } from "./shoe.router/shoe.router.js";
//import { router as deliveryAuthRouter } from "./deliveryAuth.router/deliveryAuth.router.js";
//import { router as jobRouter } from "./job.router/job.router.js";


import authUser from "../middleware/authUser.js";
import { router as cartRouter } from "./cart.router/cart.router.js";



export const router = Router();

router.use("/users", usersRouter);
//router.use("/staff", staffRouter);
router.use("/products", productsRouter);
router.use("/order", authUser, orderRouter);


//router.use("/shoes", shoeRouter);
router.use("/cart", authUser, cartRouter);

//router.use("/shoes", shoeRouter);

// ── Delivery & Return Management ───────────────────────────────────────────────
//router.use("/delivery-auth", deliveryAuthRouter);
//router.use("/jobs", jobRouter);

