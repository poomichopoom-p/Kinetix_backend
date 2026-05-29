import mongoose from "mongoose";

export async function connectDB(){
    const uri = process.env.MONGODB_URI;

    try{
        await mongoose.connect(uri,{dbName : "Kinetix"});
        console.log(`Connected Data base !!`);
    }catch(err){
        console.error(`connected fail something went worng : ${err}`);
    }
};