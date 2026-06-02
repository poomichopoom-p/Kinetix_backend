// export const allProduct = async (req, res, next) => {
//     try {
//         const doc = await Products.find();
//         return res.status(200).json({success:true, message: "Find all products success"})
//     }catch(error) {next(error)}
//     // {res.status(400).json({success:false, message: "Cann't found!", error:error})}
// }

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

export const getCategory = (req, res) => {
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