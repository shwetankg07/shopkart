import express from "express";
import { createPaymentOrder, verifyPayment, getMyOrders, getOrderById } from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

orderRoutes.use(protect);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getMyOrders);
orderRoutes.get("/:id", getOrderById);

export default orderRoutes;
