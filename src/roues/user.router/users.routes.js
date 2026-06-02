import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import {
  deleteUserById,
  getUserById,
  updateUserById,
} from "./user.controller.js";

export const router = Router();

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
import { login, registerUser } from "./user.controller.js";

export const router = Router();

// router.get("/:id", );

router.post("/register", registerUser);
router.post("/login", authUser, login);

// router.patch("/:id",);
// router.delete("/:id",)
