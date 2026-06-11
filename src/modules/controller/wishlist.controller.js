import { User } from "../Model/users-model.js";

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Get wishlist successful",
      data: user.wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { new: true },
    ).populate("wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      data: user.wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true },
    ).populate("wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      data: user.wishlist,
    });
  } catch (err) {
    next(err);
  }
};