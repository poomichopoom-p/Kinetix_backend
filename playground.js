

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




const jojoCharacters = [ { id: 1, name: "Jotaro Kujo", stand: "Star Platinum", part: 3, isVillain: false, powerLevel: 95 }, { id: 2, name: "DIO", stand: "The World", part: 3, isVillain: true, powerLevel: 99 }, { id: 3, name: "Noriaki Kakyoin", stand: "Hierophant Green", part: 3, isVillain: false, powerLevel: 80 }, { id: 4, name: "Jean Pierre Polnareff", stand: "Silver Chariot", part: 3, isVillain: false, powerLevel: 82 }, { id: 5, name: "Josuke Higashikata", stand: "Crazy Diamond", part: 4, isVillain: false, powerLevel: 85 }, { id: 6, name: "Yoshikage Kira", stand: "Killer Queen", part: 4, isVillain: true, powerLevel: 90 }, { id: 7, name: "Giorno Giovanna", stand: "Gold Experience", part: 5, isVillain: false, powerLevel: 98 } ];