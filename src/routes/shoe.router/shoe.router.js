import { Router } from "express";
import { getShoeById } from "../../modules/controller/shoe.controller.js";

export const router = Router();

router.get("/:id", getShoeById);
