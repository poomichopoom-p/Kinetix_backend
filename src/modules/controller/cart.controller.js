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
        message: "Color variant not found",
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
        message: "Insufficient stock available",
      });
    }

    // Check if item already exists in user's cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingItemIndex = user.cart.findIndex(
      (c) => c.item.toString() === item && c.skuColorCode === skuColorCode && c.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity if it exists
      user.cart[existingItemIndex].quantity += quan;
    } else {
      // Add new item if it doesn't
      user.cart.push({
        item,
        skuColorCode,
        size,
        quantity: quan,
      });
    }

    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "Cart updated successfully", data: user.cart });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const removeProduct = async (req, res, next) => {
  const { userId } = req.params;
  const { item, skuColorCode, size } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { 
          cart: { 
            item: item,
            skuColorCode: skuColorCode,
            size: size 
          } 
        } 
      },
      { new: true }
    ).populate("cart.item");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Item removed from cart", data: user.cart });
  } catch (err) {
    next(err);
  }
};
export const getAdditem = async (req, res, next) => {
  const { _id } = req.params || {};
  console.log(_id)
  try {
    const user = await User.findById({_id}).populate("cart.item").select("+cart");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    
    // Map the cart items to include product details directly for the frontend
    const cartData = (user.cart || []).map(cartItem => {
      const product = cartItem.item;
      if (!product) return cartItem;
      
      // Find the specific variant to get the image
      const variant = product.variants?.find(v => v.skuColorCode === cartItem.skuColorCode);
      
      return {
        _id: cartItem._id,
        item: product._id,
        name: product.modelName,
        price: product.rentalPlan?.[0]?.["1day"] || 0,
        image: variant?.images?.[0] || "",
        skuColorCode: cartItem.skuColorCode,
        size: cartItem.size,
        quantity: cartItem.quantity
      };
    });

    return res
      .status(200)
      .json({ success: true, message: "Get item done!", data: cartData });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId, "cart._id": itemId },
      { $set: { "cart.$.quantity": quantity } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Item or User not found" });
    }

    return res.status(200).json({ success: true, message: "Quantity updated", data: user.cart });
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { _id: itemId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Item removed from cart", data: user.cart });
  } catch (err) {
    next(err);
  }
};
*/
