import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import authStaff from "../../middleware/authStaff.js";
import {
  createNewBrand,
  createProduct,
  getProduct,
  getBrand,
  getCategory,
} from "../../modules/controller/products.controller.js";
import { getShoeById } from "../../modules/controller/shoe.controller.js";

export const router = Router();

router.get("/", getProduct);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);
router.get("/:id", getShoeById);
/*
GET products by category
Example:
GET /api/products/category/Road
*/
router.get("/category/:category", getCategory);

/*
GET brand
Example:
GET /api/products/brand/Nike
*/
router.get("/brand/:brand", getBrand);

/*
CREATE product
*/


