

//http://localhost:5000/api/products/nike
export const getBrand = (req,res,next) => {
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