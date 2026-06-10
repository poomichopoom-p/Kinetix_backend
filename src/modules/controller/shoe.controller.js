import mongoose from "mongoose";
<<<<<<< HEAD
import { Shoe } from "../Model/shoue-model.js";
=======
import { Shoe } from "../Model/shoe-model.js";
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
import { Products } from "../Model/products-model.js";
// GET /api/shoes/:id
export const getShoeById = async (req, res, next) => {
  const { id } = req.params;

  // Reject malformed IDs before hitting the database
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shoe ID" });
  }

  try {
    const shoe = await Products.findById(id);
    console.log(shoe);
    if (!shoe) {
      return res.status(404).json({ message: "Shoe not found" });
    }

    return res.status(200).json({ data: shoe });
  } catch (err) {
    next(err);
  }
};
