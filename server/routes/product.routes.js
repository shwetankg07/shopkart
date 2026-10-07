import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const productRoutes = express.Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProductById);

productRoutes.post("/", protect, adminOnly, upload.single("image"), createProduct);
productRoutes.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
productRoutes.delete("/:id", protect, adminOnly, deleteProduct);

export default productRoutes;
