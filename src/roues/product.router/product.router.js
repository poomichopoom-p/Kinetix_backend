import { Router } from "express";

import { allProduct } from "./productsr.controller.js"
import { getBrand } from "./productsr.controller.js";
import { getCategory } from "./productsr.controller.js";

export const router = Router();

// router.get("/allProducts", allProduct)

router.get("/:brand", {getBrand})

router.get("/:category", {getCategory} )
