import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true, // the login cookie only travels cross-origin with this on
});

export const errorMessage = (error, fallback) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return fallback;
};

export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");
export const changePassword = (data) => api.patch("/customers/change-password", data);

export const fetchProducts = (params) => api.get("/products", { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) => api.post("/products", formData);
export const updateProduct = (id, formData) => api.put(`/products/${id}`, formData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const fetchWishlist = () => api.get("/wishlist");
export const removeFromWishlist = (id) => api.delete(`/wishlist/${id}`);
export const toggleWishlist = (id) => api.patch(`/wishlist/${id}/toggle`);

export const fetchCart = () => api.get("/cart");
export const addToCart = (id) => api.post(`/cart/${id}`);
export const updateCartItem = (id, quantity) => api.patch(`/cart/${id}`, { quantity });
export const removeCartItem = (id) => api.delete(`/cart/${id}`);

export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPayment = (data) => api.post("/orders/verify-payment", data);
export const fetchOrders = () => api.get("/orders");
export const fetchOrder = (id) => api.get(`/orders/${id}`);
export const fetchAllOrders = () => api.get("/orders/admin/all");
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
