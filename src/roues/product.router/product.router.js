import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import { getProduct } from "../../modules/controller/productsr.controller.js";
import { getBrand } from "../../modules/controller/productsr.controller.js";
import { getCategory } from "../../modules/controller/productsr.controller.js";

export const router = Router();

router.get("/", getProduct);

router.get("/:brand", getBrand)

router.get("/:category", getCategory)

