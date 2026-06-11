import { Router } from "express";
import { addItem, getAdditem, updateItem, deleteItem, removeProduct } from "../../modules/controller/cart.controller.js";
import authUser from "../../middleware/authUser.js";


export const router = Router();

router.use(authUser);

router.post("/addItem/:userId", addItem);
router.delete("/removeItem/:userId", removeProduct);
router.get("/:_id", getAdditem );
router.patch("/:userId/:itemId", updateItem);
router.delete("/:userId/:itemId", deleteItem);
