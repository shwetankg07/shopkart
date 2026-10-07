import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { serverError } from "../utils/serverError.js";
import { uploadImage } from "../utils/uploadImage.js";

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validationMessage = (error) => {
  const firstError = Object.values(error.errors)[0];
  return firstError.message;
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // an uploaded file wins, otherwise accept a plain image url (handy from postman)
    let image = req.body.image;
    if (req.file) {
      image = await uploadImage(req.file.buffer);
    }

    if (!name || !description || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (price === undefined || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({ name, description, price, category, image, stock });

    res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: validationMessage(error) });
    }
    serverError(res, error);
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
    serverError(res, error);
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
    serverError(res, error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = ["name", "description", "price", "category", "stock", "image"];
    for (const field of fields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        product[field] = req.body[field];
      }
    }

    if (req.file) {
      product.image = await uploadImage(req.file.buffer);
    }

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: validationMessage(error) });
    }
    serverError(res, error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    serverError(res, error);
  }
};
