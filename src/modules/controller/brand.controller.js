import { Brand } from '../Model/Brand.model.js';

export const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const newBrand = new Brand({ name });
        await newBrand.save();
        res.status(201).json(newBrand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};