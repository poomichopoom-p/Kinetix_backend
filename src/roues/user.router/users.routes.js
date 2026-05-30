import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import { registerUser } from "./user.controller.js";


export const router = Router();
// http//localhst:5000/api/users/login
// router.get("/:id", );


// router.post("/register", );
router.post("/login",authUser,);
router.get("/", registerUser)

// router.patch("/:id",);
// router.delete("/:id",)

