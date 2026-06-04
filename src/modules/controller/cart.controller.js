import { Products } from "../Model/products-model.js";
import { User } from "../Model/users-model.js";

export const addItem = async (req, res, next) => {
  const { item, skuColorCode, size, quantity } = req.body || {};

  if (!item || !skuColorCode || !size || !quantity) {
    return res.status(400).json({
      success: false,
      message: "can't found product",
    });
  }

  try {
    const product = await Products.findById(item);
    
    const variant = product.variants.find(
      (v) => v.skuColorCode === skuColorCode,
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    const selectedSize = variant.size.find((s) => s.size === size);

    if (!selectedSize) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    if (selectedSize.stock < size) {
      return res.status(400).json({
        success: false,
        message: "Out of stock",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $push: {
        cart: {
          item,
          skuColorCode,
          size,
          quantity,
        },
      },
    });

    return res.status(201).json({ success: true, message: "Add success!" });
  } catch (err) {
    // err.name = "Server Error can't add item";
    err.status = 501;
    err.message = "The backend system is malfunctioning.";
    next(err);
  }
};
