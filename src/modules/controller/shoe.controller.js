import mongoose from "mongoose";
import { Shoe } from "../Model/shoue-model.js";
import { Products } from "../Model/products-model.js";
// GET /api/shoes/:id
export const getShoeById = async (req, res, next) => {
  const { id } = req.params;

  // Reject malformed IDs before hitting the database
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shoe ID" });
  }

  try {
    const shoe = await Shoe.findById(id);
    if (!shoe) {
      return res.status(404).json({ message: "Shoe not found" });
    }

    return res.status(200).json({ data: shoe });
  } catch (err) {
    next(err);
  }
};
