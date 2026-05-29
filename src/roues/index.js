import { Router } from "express";
import { router as usersRouter } from "./user.router/users.routes.js";
import { router as productsRouter } from "./product.router/product.router.js";
import { router as staffRouter } from "./staff.router/staff.router.js";

export const router = Router();

router.use("/users", usersRouter);
router.use("/staff", staffRouter);
router.use("/products", productsRouter);
