import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";
import {
  getAllStaff,
  getStaffById,
  updateStaff,
  registerStaff,
} from "../../modules/controller/staff.controller.js";

export const router = Router();

router.post("/staffRegister", registerStaff);
// GET /api/staff?role=admin
router.get("/", getAllStaff);

// GET /api/staff/:staffId?fields=name,surname,role
router.get("/:staffId", getStaffById);

// PATCH /api/staff/:id — admin only
router.patch("/:id", authUser, isAdmin, updateStaff);


