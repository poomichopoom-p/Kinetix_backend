import { Router } from "express";
import { addToCart, getCart, removeFromCart } from "../../modules/controller/cart.controller.js";
import authUser from "../../middleware/authUser.js";

export const router = Router();

// All router require authentication
router.use(authUser);

// POST /api/cart/addItem
router.post("/addItem/:_id", addToCart);

// GET /api/cart/:_id
router.get("/:_id", getCart);

// DELETE /api/cart/removeItem/:_id
router.delete("/removeItem/:_id", removeFromCart);