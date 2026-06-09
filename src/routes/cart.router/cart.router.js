import { Router } from "express";
import { addItem, getAdditem, removeItem } from "../../modules/controller/cart.controller.js";
import authUser from "../../middleware/authUser.js";

export const router = Router();

// All routes require authentication
router.use(authUser);

// POST /api/cart/addItem
router.post("/addItem/:_id", addItem);

// GET /api/cart/:_id
router.get("/:_id", getAdditem);

// DELETE /api/cart/removeItem/:_id
router.delete("/removeItem/:_id", removeItem);