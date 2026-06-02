import { Router } from "express";
import { registerStaff } from "../../modules/controller/staff.controller.js";


export const router = Router();

router.post("/staffRegister", registerStaff)