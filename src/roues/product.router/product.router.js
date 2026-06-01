import { Router } from "express";
import authUser from "../../middelware/authUser";

export const router = Router();
// http//localhost:5000/api/products/:id
// router.get("/:id",)

router.post("/bill", authUser, async (req, res, next) => {
  const { modleName, skuColorCode, size, price } = req.body || "";
  if ((!skuColorCode || !modleName, !size, !price)) {
    return res
      .status(404)
      .json({ success: false, message: "Product detail are requied!" });
  }
  const { _id } = req.params || "";
  if (!_id) {
    return res
      .status(400)
      .json({ success: false, message: " productId requied!" });
  }
  try {
    const Product = await mongoose.find(_id).select("+price");
    if(!Product){
        return res.status(400).json({success: false, message: "Don't have this product!"});
    }
    // else if(Product.price !== price){
    //     return res.status(400).json({success: false,message:"we don't have this deal!"});
    // }
    else if(Product.stock <= 0){
        return res.status(410).json({success: true, message:"Out of stock !"});
    }
    for (let item of Product){

    }

  } catch (err) {
    next(err);
  }
});
