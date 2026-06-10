import { Cart } from "../Model/Cart.model.js";

// GET /api/cart/:_id
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params._id });
    return res.status(200).json({ success: true, data: cart?.items || [] });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ success: false, message: "Cannot load cart" });
  }
};

// POST /api/cart/addItem/:_id
export const addToCart = async (req, res) => {
  try {
    const { item, name, image, price, skuColorCode, size, quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.params._id });
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

    return res.status(200).json({ success: true, data: cart.items });
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ success: false, message: "Cannot add to cart" });
  }
};

// DELETE /api/cart/removeItem/:_id
export const removeFromCart = async (req, res) => {
  try {
    const { item, skuColorCode, size } = req.body;

    const cart = await Cart.findOne({ userId: req.params._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !(i.item.toString() === item && i.skuColorCode === skuColorCode && i.size === size)
    );
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({ success: true, data: cart.items });
  } catch (err) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ success: false, message: "Cannot remove item" });
  }
};