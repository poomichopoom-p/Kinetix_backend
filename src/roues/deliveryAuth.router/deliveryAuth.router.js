import { Router } from "express";
import deliveryAuth from "../../middelware/deliveryAuth.js";
import { register, login, getMe } from "../../modules/controller/deliveryAuth.controller.js";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", deliveryAuth, getMe);
