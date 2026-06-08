import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import {
  deleteUserById,
  GetById,
  getUserById,
  getUserProfile,
  getUserStats,
  login,
  registerUser,
  updateUserById,
  updateUserProfile,
} from "../../modules/controller/user.controller.js";

export const router = Router();

router.post("/register", registerUser);

router.post("/login", login);

router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, updateUserProfile);
router.get("/profile/stats", authUser, getUserStats);

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
