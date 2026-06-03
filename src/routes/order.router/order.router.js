import { Router } from "express";

import {
  getOrder,
  newOrder,
} from "../../modules/controller/orders.controller.js";
import authUser from "../../middelware/authUser.js";

export const router = Router();
// get all order
router.get("/", getOrder);

router.post("/create order", authUser, newOrder);
