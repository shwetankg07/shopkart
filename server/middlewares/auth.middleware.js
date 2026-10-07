import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(payload.id).select("-password");

    if (!customer) {
      return res.status(401).json({ message: "Not logged in" });
    }

    req.user = customer;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not logged in" });
  }
};
