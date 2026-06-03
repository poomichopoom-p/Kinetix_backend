import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import isAdmin from "../../middelware/isAdmin.js";
import {
  getAllStaff,
  getStaffById,
  updateStaff,
} from "../../modules/controller/staff.controller.js";

export const router = Router();

// GET /api/staff?role=admin
router.get("/", getAllStaff);

// GET /api/staff/:staffId?fields=name,surname,role
router.get("/:staffId", getStaffById);

// PATCH /api/staff/:id — admin only
router.patch("/:id", authUser, isAdmin, updateStaff);
