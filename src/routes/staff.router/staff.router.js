import { Router } from "express";
import authUser from "../../middelware/authUser.js";
import isAdmin from "../../middelware/isAdmin.js";
import { updateStaff } from "../../modules/controller/staff.controller.js";

export const router = Router();

<<<<<<< HEAD:src/routes/staff.router/staff.router.js


=======
// PATCH /api/staff/:id — admin only
router.patch("/:id", authUser, isAdmin, updateStaff);
>>>>>>> 99e5e64 (Add GET shoe by ID, PATCH staff, soft delete order):src/roues/staff.router/staff.router.js
