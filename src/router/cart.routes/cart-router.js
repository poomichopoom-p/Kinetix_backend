import express, { Router } from "express";
import { addItem, getAdditem } from "../../modules/controller/cart.controller.js";


export const router = Router();

router.post("/addItem/:_id", addItem);
// router.get("/:_id", getAdditem );