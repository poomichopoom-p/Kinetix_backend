import { Brand } from "../Model/Brand-model.js";
import { Products } from "../Model/products-model.js";

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
      message: "Products fetched successfully",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  const {
    modelName,
    description,
    brandId,
    gender,
    category,
    rentalPlan,
    variants,
  } = req.body || {};

  if (
    !modelName ||
    !brandId ||
    !gender ||
    !category ||
    !rentalPlan ||
    !variants
  ) {
    return res.status(400).json({
      success: false,
      message: "Incomplete information.",
    });
  }

  try {
    const doc = await Products.create({
      modelName,
      description,
      brandId,
      gender,
      category,
      rentalPlan,
      variants,
    });
    return res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully!",
        data: doc,
      });
  } catch (err) {
    next(err);
  }
};

export const createNewBrand = async (req, res, next) => {
  const { brandName, model } = req.body || {};
  const brand = String(brandName || "").trim();

  if (!brand) {
    return res.status(400).json({
      success: false,
      message: "Brand name is required!",
    });
  }

  try {
    const doc = await Brand.create({
      brandName: brand,
      model: model ? [model] : [],
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: doc,
    });
  } catch (err) {
    // Check for duplicate key error (MongoDB error code 11000)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Brand with name '${brand}' already exists.`,
      });
    }
    next(err); // Pass other errors to the next middleware
  }
};

export const getBrand = async (req, res, next) => {
  const { brand } = req.params || {};
  if (!brand) {
    return res
      .status(400)
      .json({ success: false, message: "brand not found!" });
  }

  try {
    const doc = await Brand.find({ brandName: brand });
    return res
      .status(200)
      .json({ success: true, message: "founded!", data: doc });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  const { category } = req.params || {};
  if (!category) {
    return res
      .status(400)
      .json({ success: false, message: "category not found!" });
  }

  try {
    const doc = await Products.find({ category });
    return res
      .status(200)
      .json({ success: true, message: "founded!", data: doc });
  } catch (err) {
    next(err);
  }
};
