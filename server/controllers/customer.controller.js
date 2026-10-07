import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import { generateToken, cookieOptions } from "../utils/generateToken.js";

const publicCustomer = (customer) => {
  return {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
  };
};

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailTaken = await Customer.findOne({ email: email.toLowerCase() });

    if (emailTaken) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ fullName, email, password: hash, phone });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: publicCustomer(customer),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // same 401 for a wrong email and a wrong password, otherwise anyone can check which emails exist
    let passwordOk = false;
    if (customer) {
      passwordOk = await bcrypt.compare(password, customer.password);
    }

    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.cookie("token", generateToken(customer._id), cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      customer: publicCustomer(customer),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMe = (req, res) => {
  res.json(publicCustomer(req.user));
};

export const logoutCustomer = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
};
