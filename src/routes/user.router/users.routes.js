import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import {
  deleteUserById,
  GetById,
  getUserById,
  login,
  registerUser,
  updateUserById,
} from "../../modules/controller/user.controller.js";

export const router = Router();

router.post("/register", registerUser);

router.post("/login", login);

router.get("/:_id", authUser, GetById);
router.patch("/:_id", authUser, updateUserById);
router.delete("/:_id", authUser, deleteUserById);
