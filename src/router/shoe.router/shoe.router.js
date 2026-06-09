import { Router } from 'express';
import {
    getAllShoes,
    getShoeById,
    getShoesByBrand,
    getShoesByCategory,
    createShoe,
    updateShoe,
    deleteShoe,
} from '../../middleware/modules/controller/shoe.controller.js';
import authUser from '../../middleware/authUser.js'; // Assuming authUser middleware exists
import authorizeRoles from '../../middleware/authorizeRoles.js'; // Assuming authorizeRoles middleware exists

export const router = Router();

// Middleware to protect shoe router for admin
router.use(authUser, authorizeRoles('admin'));

router.route('/').get(getAllShoes).post(createShoe);
router.route('/:id').get(getShoeById).patch(updateShoe).delete(deleteShoe);
router.get('/brand/:brand', getShoesByBrand);
router.get('/category/:category', getShoesByCategory);