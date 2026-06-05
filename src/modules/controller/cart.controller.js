import { Products } from "../Model/products-model.js";
import { User } from "../Model/users-model.js";

export const addItem = async (req, res, next) => {
  const { item, skuColorCode, size, quantity } = req.body || {};
  const userId = req.params._id;

  if (!item || !skuColorCode || !size || !quantity) {
    return res.status(400).json({ success: false, message: "Missing product information" });
  }

  try {
    const product = await Products.findById(item);

    const variant = product.variants.find((v) => v.skuColorCode === skuColorCode);
    if (!variant) return res.status(404).json({ success: false, message: "Color not found" });

    const selectedSize = variant.size.find((s) => s.size === size);
    if (!selectedSize) return res.status(404).json({ success: false, message: "Size not found" });

    if (selectedSize.stock < Number(quantity)) {
      return res.status(400).json({ success: false, message: "Out of stock" });
    }

    // Add item to cart array
    const user = await User.findByIdAndUpdate(userId, {
      $push: {
        cart: { item, skuColorCode, size, quantity: Number(quantity) },
      },
    }, { new: true }).select("+cart"); // { new: true } returns the updated user data

    return res.status(201).json({ success: true, message: "Add success!", data: user.cart });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAdditem = async (req, res, next) => {
  const { _id } = req.params; // FIXED: Removed ._id from the right side

  try {
    const user = await User.findById(_id).select("+cart");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    return res.status(200).json({ success: true, message: "Get item done!", data: user.cart || [] });
  } catch (err) {
    next(err);
  }
};

// NEW: Controller to delete an item
export const removeItem = async (req, res, next) => {
  const { _id } = req.params; // User ID
  const { item, skuColorCode, size } = req.body || {}; // Details of the shoe to remove

  try {
    // $pull removes the specific item from the cart array
    const user = await User.findByIdAndUpdate(_id, {
      $pull: {
        cart: { item, skuColorCode, size }
      }
    }, { new: true }).select("+cart");

    return res.status(200).json({ success: true, message: "Item removed!", data: user.cart });
  } catch (err) {
    next(err);
  }
};

/*import { Products } from "../Model/products-model.js";
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

export const getAdditem = async (req, res, next) => {
  const { _id } = req.params._id || {};
  try {
    const cart = await User.findById({ _id }).select("+cart");
    console.log(cart);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "User cart not found !" });
    }
    if (cart === []) {
      return res
        .status(200)
        .json({ success: true, message: "No item in cart.", data: cart });
    }
    return res
      .status(200)
      .json({ success: true, message: "Get item done!", data: cart });
  } catch (err) {
    next(err);
  }
};
*/
