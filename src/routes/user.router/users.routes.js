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
// https://kinetix-qnx5.onrender.com/api/users/profile (get user profile)
// https://kinetix-qnx5.onrender.com/api/users/profile (update user profile)
// https://kinetix-qnx5.onrender.com/api/users/profile/stats (get user stats)
// https://kinetix-qnx5.onrender.com/api/users/:id (get User By Id)
// https://kinetix-qnx5.onrender.com/api/users/:id (update User By Id)
// https://kinetix-qnx5.onrender.com/api/users/:id (delete User By Id)

router.post("/register", registerUser);

router.post("/login", login);

router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, updateUserProfile);
router.get("/profile/stats", authUser, getUserStats);

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
