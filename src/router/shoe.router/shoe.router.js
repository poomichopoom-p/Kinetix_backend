import { Router } from 'express';
import { getShoeById } from '../../modules/controller/shoe.controller.js';
import {
    getProduct as getAllShoes,
    getBrand as getShoesByBrand,
    getCategory as getShoesByCategory,
    createProduct as createShoe,
    deleteProduct as deleteShoe,
} from '../../modules/controller/products.controller.js';
import authUser from '../../middleware/authUser.js';
import authorizeRoles from '../../middleware/authorizeRoles.js';

export const router = Router();

// Middleware to protect shoe router for admin
router.use(authUser, authorizeRoles('admin'));

router.route('/').get(getAllShoes).post(createShoe);
router.route('/:id').get(getShoeById).delete(deleteShoe);
router.get('/brand/:brand', getShoesByBrand);
router.get('/category/:category', getShoesByCategory);