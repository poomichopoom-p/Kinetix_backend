import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import isAdmin from "../../middelware/isAdmin.js";
import { updateStaff } from "../../modules/controller/staff.controller.js";
import { registerStaff } from "../../modules/controller/staff.controller.js";

export const router = Router();

// PATCH /api/staff/:id — admin only
router.patch("/:id", authUser, isAdmin, updateStaff);

router.post("/staffRegister", registerStaff)

