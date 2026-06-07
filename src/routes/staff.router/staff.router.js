import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";
import {
  getAllStaff,
  getStaffById,
  updateStaff,
  registerStaff,
  staffLogin,
} from "../../modules/controller/staff.controller.js";

export const router = Router();

router.post("/staffRegister", registerStaff);
// GET /api/staff?role=admin
router.get("/", getAllStaff);

// GET /api/staff/:staffId?fields=name,surname,role
router.get("/:_staffId", getStaffById);

// PATCH /api/staff/:id — admin only
router.patch("/:_id", authUser, isAdmin, updateStaff);
router.post("/admin/login",staffLogin)


