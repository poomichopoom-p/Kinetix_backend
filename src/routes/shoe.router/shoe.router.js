import { Router } from "express";
import { getShoeById } from "../../modules/controller/shoe.controller.js";

export const router = Router();

// GET /api/shoes/:id
router.get("/:id", getShoeById);
