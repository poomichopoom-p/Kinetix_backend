import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import { login, registerUser } from "../../modules/controller/user.controller.js";

export const router = Router();

// router.get("/:id", );

router.post("/register", registerUser);
router.post("/login", authUser, login);
router.post("/login",authUser, );

