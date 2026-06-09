import { Cart } from "../Model/Cart.model.js";
import {User} from "../Model/user-model.js"

// GET /api/cart/:_id
export const getCart = async (req, res) => {
  try {
    const cart = await User.findOne({ userId: req.params._id });
    return res.status(200).json({ success: true, data: cart?.items || [] });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ success: false, message: "Cannot load cart" });
  }
};

// POST /api/cart/addItem/:_id
export const addToCart = async (req, res) => {
  try {
    const { item, name, image, price, skuColorCode, size, quantity } = req.body || {};

    let cart = await User.findOne({ userId: req.params._id });
    if (!cart) cart = new Cart({ userId: req.params._id, items: [] });

    const existing = cart.items.find(
      (i) => i.item.toString() === item && i.skuColorCode === skuColorCode && i.size === size
    );

    
    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({ item, name, image, price, skuColorCode, size, quantity: quantity || 1 });
    }

    cart.updatedAt = new Date();
    await cart.save();

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
    console.error("Remove from cart error:", err);
    return res.status(500).json({ success: false, message: "Cannot remove item" });
  }
};