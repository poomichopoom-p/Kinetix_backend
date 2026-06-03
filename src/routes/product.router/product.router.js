/*import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import authStaff from "../../middleware/authStaff.js";
import {
  createNewBrand,
  createProduct,
  getProduct,
} from "../../modules/controller/products.controller.js";

import {
  getBrand,
  getCategory,
} from "../../modules/controller/products.controller.js";

export const router = Router();

router.get("/", getProduct);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);

router.get("/:brand", getBrand)

router.get("/:category", getCategory)*/

import { Router } from "express";

import {
  createNewBrand,
  createProduct,
  getProduct,
  getBrand,
  getCategory,
} from "../../modules/controller/products.controller.js";

export const router = Router();

/*
GET all products
*/
router.get("/", getProduct);

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
router.post("/createProduct", createProduct);

/*
CREATE brand
*/
router.post("/newBrand", createNewBrand);
router.get("/:brand", getBrand);

router.get("/:category", getCategory);
