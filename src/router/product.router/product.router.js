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
  getShoeById,
  updateProduct,
} from "../../modules/controller/products.controller.js";
import { getShoeById } from "../../modules/controller/shoe.controller.js";

export const router = Router();

router.get("/", getProduct);
router.get("/brand", allBand); // More specific than /brand/:brand
router.get("/brand/:brand", getBrand);
router.get("/category/:category", getCategory);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);
router.patch("/:id", updateProduct);
router.get("/:id", getShoeById); // Use :id for consistency and place after more specific routes
router.delete("/:id", deleteProduct); // Use :id for consistency
