import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const orderRoutes = express.Router();

orderRoutes.use(protect);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getMyOrders);
orderRoutes.get("/:id", getOrderById);

orderRoutes.get("/admin/all", adminOnly, getAllOrders);
orderRoutes.patch("/:id/status", adminOnly, updateOrderStatus);

export default orderRoutes;
