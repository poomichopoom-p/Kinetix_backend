import express, { Router } from "express";
import { addItem } from "../../modules/controller/cart.controller.js";


export const router = Router();

router.post("/addItem", addItem);