import mongoose from "mongoose";
import { Shoe } from "../Model/shoue-model.js";
<<<<<<< HEAD
import { Products } from "../Model/products-model.js";
=======

>>>>>>> 0f5700c7513125fcf24155e0f343c990fd09a5c6
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
