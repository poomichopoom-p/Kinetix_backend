import { Router } from "express";
import authUser from "../../middleware/authUser.js";
//import authStaff from "../../middleware/authStaff.js";
import {
  createNewBrand,
  createProduct,
  getProduct,
  getBrand,
  getCategory,
  allBand,
  deleteProduct,
} from "../../modules/controller/products.controller.js";
import { getShoeById } from "../../modules/controller/shoe.controller.js";

export const router = Router();

router.get("/", getProduct);
router.get("/brand", allBand);
router.get("/brand/:brand", getBrand);
router.get("/category/:category", getCategory);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);
router.get("/:id", getShoeById);
router.delete("/:id", deleteProduct); 
