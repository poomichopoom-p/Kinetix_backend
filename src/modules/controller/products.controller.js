import { Brand } from "../Model/Brand-model.js";
import { Products } from "../Model/products-model.js";

/*
GET ALL PRODUCTS
*/
export const getProduct = async (req, res, next) => {
  try {
    const doc = await Products.find()
      .populate("brandId");

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

/*
CREATE PRODUCT
*/
export const createProduct = async (req, res, next) => {
<<<<<<< HEAD
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
=======
  const { name, description, brandId, category, rentalPlan, variants } =
    req.body || "";

  // console.log({
  //   modelName,
  //   description,
  //   brandId,
  //   category,
  //   rentalPlan,
  //   variants,
  // });
  if (!name || !variants || !brandId || !category || !rentalPlan) {
    return res
      .status(404)
      .json({ success: false, message: "Incomplete information." });
>>>>>>> 27c13d3 (test-create-ProductDone)
  }

  try {
    const doc = await Products.create({
<<<<<<< HEAD
      modelName,
      description,
      brandId,
      gender,
      category,
      rentalPlan,
      variants,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: doc,
=======
      name: name,
      variants: variants,
      brandId: brandId,
      category: category,
      rentalPlan: rentalPlan,
>>>>>>> 27c13d3 (test-create-ProductDone)
    });
  } catch (err) {
    next(err);
  }
};

/*
CREATE BRAND
*/
export const createNewBrand = async (req, res, next) => {
  const { brandName, model } = req.body || {};

  const brand = String(brandName || "").trim();

  if (!brand) {
    return res.status(400).json({
      success: false,
      message: "Brand name is required",
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

/*
GET BRAND
GET /api/products/brand/Nike
*/
export const getBrand = async (req, res, next) => {
  const { brand } = req.params;

  try {
    const doc = await Brand.find({ brandName: brand });

    return res.status(200).json({
      success: true,
      message: "found!",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

/*
GET PRODUCTS BY CATEGORY
GET /api/products/category/Road
*/
export const getCategory = async (req, res, next) => {
  const { category } = req.params;

  try {
    const doc = await Products.find({ category });

    return res.status(200).json({
      success: true,
      message: "found!",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};
