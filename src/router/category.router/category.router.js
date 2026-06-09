import { Router } from 'express';
import { createCategory, getAllCategories } from '../../modules/controller/category.controller.js';
import authUser from '../../middleware/authUser.js';
import authorizeRoles from '../../middleware/authorizeRoles.js';

export const router = Router();

// Middleware to protect category router for admin
router.use(authUser, authorizeRoles('admin'));

router.route('/')
    .post(createCategory)
    .get(getAllCategories);