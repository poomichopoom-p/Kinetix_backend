import { Router } from "express";
import authStaff from "../../middleware/authStaff.js";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";
import {
  getAllStaff,
  getStaffById,
  updateStaff,
  registerStaff,
  deleteStaffById,
  staffLogin,
} from "../../modules/controller/staff.controller.js";

export const router = Router();

router.post("/staffRegister", registerStaff);
// GET /api/staff?role=admin
router.get("/", getAllStaff);

// GET /api/staff/:staffId?fields=name,surname,role
router.get("/:staffId", getStaffById);

// PATCH /api/staff/:id — admin only http://localhost:5000/api/staff/admin/login
router.patch("/:id", authStaff, isAdmin, updateStaff);
router.post("/admin/login",staffLogin)


router.delete("/:id", authUser, isAdmin, deleteStaffById);
