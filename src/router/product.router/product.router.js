import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import authStaff from "../../middleware/authStaff.js";
import {
  createNewBrand,
  createProduct,
  getProduct,
  getBrand,
  getCategory,
  allBand,
  deleteProduct,
} from "../../middleware/modules/controller/products.controller.js";
import { getShoeById } from "../../middleware/modules/controller/shoe.controller.js";

export const router = Router();

router.get("/", getProduct);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);

router.get("/brand/:brand", getBrand);
router.get("/brand", allBand);
router.get("/category/:category", getCategory);
router.get("/:_id", getShoeById);
router.delete("/:_id", deleteProduct)
