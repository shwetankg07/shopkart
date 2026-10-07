import mongoose from "mongoose";
import Product from "../models/product.model.js";

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (price === undefined || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ message: firstError.message });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort(
      SORT_OPTIONS[sort] || { createdAt: -1 }
    );

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
