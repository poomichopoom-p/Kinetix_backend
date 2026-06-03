import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import {
  login,
  registerUser,
} from "../../modules/controller/user.controller.js";

export const router = Router();



router.post("/register", registerUser);

router.post("/login",  login);



export const router = Router();

router.get("/:id", authUser, getUserById);
router.patch("/:id", authUser, updateUserById);
router.delete("/:id", authUser, deleteUserById);


router.post("/register", registerUser);
router.post("/login", login);



