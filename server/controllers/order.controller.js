import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import razorpay from "../config/razorpay.js";
import { serverError } from "../utils/serverError.js";

const ADDRESS_FIELDS = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

// returns an error message, or null when the address is fine
const checkAddress = (address) => {
  if (!address) {
    return "Shipping address is required";
  }

  for (const field of ADDRESS_FIELDS) {
    const value = address[field];
    if (typeof value !== "string" || value.trim() === "") {
      return "All address fields are required";
    }
  }

  if (!/^[0-9]{10}$/.test(address.phone.trim())) {
    return "Phone must be 10 digits";
  }

  if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
    return "Pincode must contain 6 digits";
  }

  return null;
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const addressError = checkAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (customer.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // prices and stock come from the database right now, never from the request
    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (product === null) {
        return res.status(400).json({ message: "A product in your cart is no longer available" });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount = totalAmount + product.price * cartItem.quantity;
    }

    const address = {};
    for (const field of ADDRESS_FIELDS) {
      address[field] = shippingAddress[field].trim();
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount,
    });

    // razorpay wants paise, not rupees
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (error) {
      console.error("Razorpay order failed:", error);
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(502).json({
        message: "Couldn't reach the payment service. Your cart hasn't changed, try again in a moment.",
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    serverError(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details are missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.json({ success: true, message: "Payment already verified", order });
    }

    // sign with the razorpay order id we stored, not one the browser sent
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order.razorpayOrderId + "|" + razorpay_payment_id)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(String(razorpay_signature));

    let signatureOk = false;
    if (expectedBuffer.length === receivedBuffer.length) {
      signatureOk = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

    if (!signatureOk) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
    }

    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    serverError(res, error);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    // an abandoned checkout leaves a PENDING_PAYMENT order behind, that isn't something the customer bought
    const orders = await Order.find({ user: req.user._id, status: { $ne: "PENDING_PAYMENT" } }).sort({
      createdAt: -1,
    });

    res.json({ success: true, orders });
  } catch (error) {
    serverError(res, error);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    // filtering by user too means someone else's order id just looks like it doesn't exist
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    serverError(res, error);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "PENDING_PAYMENT" } })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email");

    res.json({ success: true, orders });
  } catch (error) {
    serverError(res, error);
  }
};

const NEXT_STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!NEXT_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of ${NEXT_STATUSES.join(", ")}` });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Only paid orders can move forward" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    serverError(res, error);
  }
};
