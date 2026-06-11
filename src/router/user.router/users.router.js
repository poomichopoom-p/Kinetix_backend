import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import {
  deleteUserById,
  getUserById,
  getUserProfile,
  getUserStats,
  login,
  registerUser,
  updateUserById,
  updateUserProfile,
  usersLogout,
} from "../../modules/controller/user.controller.js";

export const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", usersLogout)

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);


router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, updateUserProfile);
router.get("/profile/stats", authUser, getUserStats);