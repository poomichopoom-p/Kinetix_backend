import { Router } from "express";

import { getOrder } from "../../modules/controller/orders.controller.js";

export const router = Router();

router.get("/", getOrder);
