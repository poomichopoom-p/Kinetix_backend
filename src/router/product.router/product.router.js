import { Router } from "express";
import authUser from "../../middleware/authUser.js";
//import authStaff from "../../middleware/authStaff.js";
import {
  createNewBrand,
  createProduct,
  getProduct,
  getBrand,
  getCategory,
  allBand,
  deleteProduct,
} from "../../modules/controller/products.controller.js";
<<<<<<< HEAD
=======
import { getShoeById } from "../../modules/controller/shoe.controller.js";
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a

export const router = Router();

router.get("/", getProduct);
<<<<<<< HEAD
router.get("/brand", allBand); // More specific than /brand/:brand
=======
router.get("/brand", allBand);
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
router.get("/brand/:brand", getBrand);
router.get("/category/:category", getCategory);
router.post("/createProduct", createProduct);
router.post("/newBrand", createNewBrand);
<<<<<<< HEAD
router.get("/:id", getShoeById); // Use :id for consistency and place after more specific routes
router.delete("/:id", deleteProduct); // Use :id for consistency
=======
router.get("/:id", getShoeById);
router.delete("/:id", deleteProduct); 
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
