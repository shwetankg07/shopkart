import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { serverError } from "../utils/serverError.js";

const findCartItem = (customer, productId) => {
  return customer.cart.find((item) => item.product.toString() === productId);
};

// every cart endpoint answers with the whole updated cart
const sendCart = async (res, customerId, message) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });

  const cart = [];
  const foundIds = [];

  for (const item of customer.cart) {
    if (item.product !== null) {
      cart.push({ product: item.product, quantity: item.quantity });
      foundIds.push(item.product._id);
    }
  }

  // products deleted after being added come back as null, drop them for good
  if (cart.length < customer.cart.length) {
    await Customer.updateOne(
      { _id: customerId },
      { $pull: { cart: { product: { $nin: foundIds } } } }
    );
  }

  res.json({ success: true, message, cart });
};

export const getCart = async (req, res) => {
  try {
    await sendCart(res, req.user._id, "Cart fetched");
  } catch (error) {
    serverError(res, error);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = findCartItem(req.user, productId);
    let newQuantity = 1;
    if (existing) {
      newQuantity = existing.quantity + 1;
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} left in stock` });
    }

    if (existing) {
      await Customer.updateOne(
        { _id: req.user._id, "cart.product": productId },
        { $set: { "cart.$.quantity": newQuantity } }
      );
    } else {
      // the $ne check stops a double click from pushing two rows for one product
      await Customer.updateOne(
        { _id: req.user._id, "cart.product": { $ne: productId } },
        { $push: { cart: { product: productId, quantity: 1 } } }
      );
    }

    await sendCart(res, req.user._id, "Cart updated");
  } catch (error) {
    serverError(res, error);
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a whole number of at least 1" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!findCartItem(req.user, productId)) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} left in stock` });
    }

    await Customer.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $set: { "cart.$.quantity": quantity } }
    );

    await sendCart(res, req.user._id, "Cart updated");
  } catch (error) {
    serverError(res, error);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!findCartItem(req.user, productId)) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    await Customer.updateOne({ _id: req.user._id }, { $pull: { cart: { product: productId } } });

    await sendCart(res, req.user._id, "Product removed from cart");
  } catch (error) {
    serverError(res, error);
  }
};
