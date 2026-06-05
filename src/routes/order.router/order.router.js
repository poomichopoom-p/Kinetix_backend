import { Router } from "express";

import {
  getOrder,
  newOrder,
  deleteOrder,
} from "../../modules/controller/orders.controller.js";
import authUser from "../../middleware/authUser.js";
//import isAdmin from "../../middleware/isAdmin.js";

export const router = Router();
// get all order
router.get("/", getOrder);

router.post("/create-order", authUser, newOrder);

/*DELETE /api/order/:id
router.delete("/:id", authUser, isAdmin, deleteOrder);*/
