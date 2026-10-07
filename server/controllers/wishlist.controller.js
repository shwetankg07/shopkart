import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { serverError } from "../utils/serverError.js";

const isInWishlist = (customer, productId) => {
  return customer.wishlist.some((id) => id.toString() === productId);
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (isInWishlist(req.user, productId)) {
      return res.status(409).json({ message: "Product already in wishlist" });
    }

    // $addToSet so two quick clicks still can't store the same product twice
    await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });

    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    serverError(res, error);
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    // a product deleted after it was saved comes back as null
    const wishlist = customer.wishlist.filter((product) => product !== null);

    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    serverError(res, error);
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!isInWishlist(req.user, productId)) {
      return res.status(404).json({ message: "Product not in wishlist" });
    }

    await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });

    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    serverError(res, error);
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (isInWishlist(req.user, productId)) {
      await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });
      return res.json({ success: true, saved: false, message: "Product removed from wishlist" });
    }

    await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
    res.json({ success: true, saved: true, message: "Product added to wishlist" });
  } catch (error) {
    serverError(res, error);
  }
};
