import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    SKU: { type: String},
    brand: { type: String},
    model_name: { type: String},
    category : { type: String, enum: ["Men", "Women", "Unisex"]},// enum ใน Mongoose คือการ กำหนดค่าที่อนุญาตให้เก็บได้เท่านั้น ถ้าส่งค่าที่ไม่ได้อยู่ในรายการเข้ามา Mongoose จะ Validation Error ทันที
    color: { type: String},
    size: { type: Number},
    stock: { type: Number}
});

export const Product = mongoose.model("Product", productSchema);