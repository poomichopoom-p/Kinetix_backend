import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import {
  deleteUserById,
  getUserById,
  login,
  registerUser,
  updateUserById,
<<<<<<< HEAD
  usersLogout,
=======
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
} from "../../modules/controller/user.controller.js";

export const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
<<<<<<< HEAD
router.post("/logout", usersLogout)

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
=======

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
