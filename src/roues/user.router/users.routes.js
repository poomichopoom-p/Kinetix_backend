import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import {
  deleteUserById,
  getUserById,
  updateUserById,
} from "./user.controller.js";

export const router = Router();

<<<<<<< HEAD
router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
=======
// router.get("/:id", );

router.post("/register", registerUser);
router.post("/login", login);

// router.patch("/:id",);
// router.delete("/:id",)
>>>>>>> 99e5e64 (Add GET shoe by ID, PATCH staff, soft delete order)
