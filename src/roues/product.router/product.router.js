import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import authStaff from "../../middelware/authStaff.js";
import {
  createProduct,
  getProduct,
} from "../../modules/controller/products.controller.js"

import { allProduct } from "./productsr.controller.js"
import { getBrand } from "./productsr.controller.js";
import { getCategory } from "./productsr.controller.js";

export const router = Router();

router.get("/", getProduct);
router.post("/createProduct", createProduct);
// router.post("/new Brand",)

router.get("/:brand", {getBrand})

router.get("/:category", {getCategory} )

