import { Products } from "../Model/products-model.js";
import { User } from "../Model/users-model.js";

export const addItem = async (req, res, next) => {
  const { item, skuColorCode, size, quantity } = req.body || {};
  const userId = req.params._id;
  if (!item || !skuColorCode || !size || !quantity) {
    return res.status(400).json({
      success: false,
      message: "can't found product",
    });
  }

  const quan = Number(quantity || {});
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

    if (selectedSize.stock < quan) {
      return res.status(400).json({
        success: false,
        message: "Out of stock",
      });
    }

    const p = await User.findByIdAndUpdate(userId, {
      $push: {
        cart: {
          item,
          skuColorCode,
          size,
          quantity,
        },
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Add success!", data: p });
  } catch (err) {
    // err.name = "Server Error can't add item";
    // err.status = 501;
    // err.message = "The backend system is malfunctioning.";
    console.error(err);
    next(err);
  }
};
