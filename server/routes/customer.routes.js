import express from "express";
import { registerCustomer, loginCustomer, getMe, logoutCustomer } from "../controllers/customer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);
customerRoutes.post("/login", loginCustomer);
customerRoutes.get("/me", protect, getMe);
customerRoutes.post("/logout", protect, logoutCustomer);

export default customerRoutes;
