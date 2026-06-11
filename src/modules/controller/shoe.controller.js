import mongoose from "mongoose";
import { Shoe } from "../Model/shoe-model.js";
import { Products } from "../Model/products-model.js";
// GET /api/shoes/:id
export const getShoeById = async (req, res, next) => {
    const { id } = req.params;

    // Reject malformed IDs before hitting the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid shoe ID" });
    }

    try {
        // const shoe = await Products.findById(id);
        const shoe = await Shoe.findById(id);
        console.log(shoe);
        if (!shoe) {
            return res.status(404).json({ message: "Shoe not found" });
        }

        return res.status(200).json({ data: shoe });
    } catch (err) {
        next(err);
    }
};

/*
import { Shoe } from '../models/Shoe.js';

// Get all shoes
export const getAllShoes = async (req, res) => {
    try {
        const shoes = await Shoe.find();
        res.status(200).json(shoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single shoe by ID
export const getShoeById = async (req, res) => {
    try {
        const { id } = req.params;
        const shoe = await Shoe.findById(id);
        if (!shoe) {
            return res.status(404).json({ message: 'Shoe not found' });
        }
        res.status(200).json(shoe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get shoes by brand
export const getShoesByBrand = async (req, res) => {
    try {
        const { brand } = req.params;
        const shoes = await Shoe.find({ brand: new RegExp(brand, 'i') }); // Case-insensitive search
        res.status(200).json(shoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get shoes by category
export const getShoesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const shoes = await Shoe.find({ category: new RegExp(category, 'i') }); // Case-insensitive search
        res.status(200).json(shoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new shoe product
export const createShoe = async (req, res) => {
    try {
        const newShoe = new Shoe(req.body);
        await newShoe.save();
        res.status(201).json(newShoe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a shoe product
export const updateShoe = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedShoe = await Shoe.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedShoe) {
            return res.status(404).json({ message: 'Shoe not found' });
        }
        res.status(200).json(updatedShoe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a shoe product
export const deleteShoe = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedShoe = await Shoe.findByIdAndDelete(id);
        if (!deletedShoe) {
            return res.status(404).json({ message: 'Shoe not found' });
        }
        res.status(200).json({ message: 'Shoe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
*/