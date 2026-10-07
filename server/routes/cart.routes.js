import express from "express";
import { getCart, addToCart, updateCartQuantity, removeFromCart } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const cartRoutes = express.Router();

cartRoutes.use(protect);

cartRoutes.get("/", getCart);
cartRoutes.post("/:productId", addToCart);
cartRoutes.patch("/:productId", updateCartQuantity);
cartRoutes.delete("/:productId", removeFromCart);

export default cartRoutes;
