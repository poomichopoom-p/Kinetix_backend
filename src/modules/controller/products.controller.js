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
      message: "Get Product Done!!",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  const { name, description, brandId, category, rentalPlan, variants } =
    req.body || "";
  if (!name || !variants || !brandId || !category || !rentalPlan) {
    return res
      .status(404)
      .json({ success: true, message: "Incomplete information." });
  }
  const { skuColorCode } = variants.skuColorCode;
  const { colorName } = variants.colorName;
  const { images } = variants.images;
  const { sizes } = variants.sizes;
  const { size } = sizes.size;
  const { stock } = sizes.stock;

  try {
    const doc = await Products.create({
      name: name,
      variants: variants,
      brandId: brandId,
      category: category,
      rentalPlan: rentalPlan,
    });
    return res
      .status(201)
      .json({ success: true, message: "Create successful!", data: doc });
  } catch (err) {
    next(err);
  }
};

export const createNewBrand = async (req, res, next) => {
  const { brandName,model } = req.body || "";
 if(!brandName){
  return res.status(404).json({
    success: false,
    message:"Brand name is reqired!"
  });
  try{
    const doc = await Brand.create(brandName)
  }catch(err){
    next(err)
  }
 }
};



export const getBrand = async (req,res,next) => {
    const {brand} = req.body || "";
    if(!brand){
        res.status(400).json({success: false, message:"brand not found!"})
    }

    try{
        const doc = await Brand.find(brand);
        return res.status(200).json({success:true,message:"founded!",data: doc})
    }catch(err){
        next(err);
    }
}

export const getCategory = async (req, res, next) => {
    const {category} = req.body || "";
    if(!category){
        res.status(400).json({success: false, message:"category not found!"})
    }

    try{
        const doc = await Products.find(category);
        return res.status(200).json({success:true,message:"founded!",data: doc})
    }catch(err){
        next(err);
    }
}