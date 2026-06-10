import mongoose from 'mongoose';

const shoeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });

export const Shoe = mongoose.model('Shoe', shoeSchema);