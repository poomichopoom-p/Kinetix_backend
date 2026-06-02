import { Products } from "../Model/products-model";

export const getProduct = async (req, res, next) => {
  try {
    const doc = await Products.find();
    if (!doc) {
      return res.status(500).json({
        success: false,
        message: "server error can't get Product!",
        error: err,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get Product Done!!",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};


