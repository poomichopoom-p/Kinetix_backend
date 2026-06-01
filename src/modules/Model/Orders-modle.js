import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
    // costomerId:ObjectId(001),
    status: {type:Srting,required:true,enum:["successful","Waiting","Fail"]},
    rental_plan: {"7day":1200},
    ordered_at:{ type: Date, default: Date.now },
    delivery_date:{ type: Date },
    item:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
    suspended_at:{ type: Date, default: Date.end },
    created_at:{ type: Date, default: Date.now },
    }
)