import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import {
  login,
  registerUser,
  logout
} from "../../modules/controller/user.controller.js";

export const router = Router();

// router.get("/:id", );

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);



