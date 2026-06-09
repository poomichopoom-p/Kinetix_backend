import { Router } from 'express';
import { createBrand, getAllBrands } from '../../middleware/modules/controller/brand.controller.js';
import authUser from '../../middleware/authUser.js';
import authorizeRoles from '../../middleware/authorizeRoles.js';

export const router = Router();

// Middleware to protect brand router for admin
router.use(authUser, authorizeRoles('admin'));

router.route('/')
    .post(createBrand) // For /newBrand equivalent
    .get(getAllBrands); // For /brand equivalent (to get all brands)