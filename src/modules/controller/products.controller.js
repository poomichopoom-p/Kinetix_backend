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

export const getBrand = async (req,res,next) => {
    const {brand} = req.body || "";
    if(!brand){
        res.status(400).json({success: false, message:"brand not found!"})
    }

    try{
        const doc = await mongoose.find(brand);
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
        const doc = await mongoose.find(category);
        return res.status(200).json({success:true,message:"founded!",data: doc})
    }catch(err){
        next(err);
    }
}