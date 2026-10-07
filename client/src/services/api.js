import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // needed or the browser drops the cookie on cross-origin requests
});

export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");

export const fetchProducts = (params) => api.get("/products", { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
