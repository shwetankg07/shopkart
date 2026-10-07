// boots the real server against an in-memory mongo and walks the whole flow. run with npm test
import assert from "node:assert";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "./models/order.model.js";
import Product from "./models/product.model.js";
import Customer from "./models/customer.model.js";

const BASE = "http://localhost:8099";
const mongo = await MongoMemoryServer.create();

const server = spawn("node", ["index.js"], {
  env: { ...process.env, MONGO_URI: mongo.getUri(), JWT_SECRET: "test-secret",
    PORT: "8099",
    RAZORPAY_KEY_ID: "rzp_test_dummy",
    RAZORPAY_KEY_SECRET: "test-razorpay-secret",
    CLIENT_URL: "http://localhost:5173",
    CLOUDINARY_CLOUD_NAME: "test",
    CLOUDINARY_API_KEY: "test",
    CLOUDINARY_API_SECRET: "test",
  },
  stdio: ["ignore", "pipe", "inherit"],
});

await new Promise((resolve) =>
  server.stdout.on("data", (d) => String(d).includes("Server running") && resolve())
);
await mongoose.connect(mongo.getUri());

const post = (path, body, cookie) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
    body: JSON.stringify(body),
  });

const send = (method, path, body, cookie) =>
  fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
    body: body ? JSON.stringify(body) : undefined,
  });

const get = (path, cookie) =>
  fetch(BASE + path, { headers: { ...(cookie && { Cookie: cookie }) } });

const customer = {
  fullName: "John Doe",
  email: "john@gmail.com",
  password: "john123",
  phone: "9876543210",
};

const keyboard = {
  name: "Mechanical Keyboard",
  description: "RGB mechanical keyboard with blue switches.",
  price: 2999,
  category: "Electronics",
  image: "https://example.com/keyboard.jpg",
  stock: 10,
};

const novel = {
  name: "Atomic Habits",
  description: "Build good habits and break bad ones.",
  price: 499,
  category: "Books",
  image: "https://example.com/book.jpg",
  stock: 60,
};

try {
  let res = await post("/customers/register", customer);
  let body = await res.json();
  assert.equal(res.status, 201, "register should succeed");
  assert.equal(body.customer.password, undefined, "password must never be returned");
  const customerId = body.customer._id;

  res = await post("/customers/register", customer);
  assert.equal(res.status, 409, "duplicate email should be rejected");

  res = await post("/customers/register", { ...customer, email: "b@b.com", password: "123" });
  assert.equal(res.status, 400, "short password should be rejected");

  res = await get("/customers/me");
  assert.equal(res.status, 401, "/me must be protected");

  res = await post("/customers/login", { email: customer.email, password: "wrong" });
  assert.equal(res.status, 401, "wrong password should be rejected");

  res = await post("/customers/login", { email: customer.email, password: customer.password });
  assert.equal(res.status, 200, "login should succeed");
  const [setCookie] = res.headers.getSetCookie();
  assert.match(setCookie, /HttpOnly/, "the token cookie must be HttpOnly");
  const cookie = setCookie.split(";")[0];

  res = await get("/customers/me", cookie);
  body = await res.json();
  assert.equal(res.status, 200, "/me should work when logged in");
  assert.equal(body.email, customer.email);
  assert.equal(body.password, undefined, "password must never be returned");

  res = await post("/customers/logout", {}, cookie);
  assert.equal(res.status, 200, "logout should succeed");
  assert.match(res.headers.getSetCookie()[0], /token=;/, "logout must clear the cookie");

  res = await get("/products");
  body = await res.json();
  assert.equal(res.status, 200, "product listing should work when empty");
  assert.equal(body.count, 0, "empty catalogue should report zero");
  assert.deepEqual(body.products, [], "empty catalogue should return an empty array");

  res = await post("/products", keyboard);
  assert.equal(res.status, 401, "creating a product needs a login");

  res = await post("/customers/login", { email: customer.email, password: customer.password });
  const admin = res.headers.getSetCookie()[0].split(";")[0];

  res = await post("/products", keyboard, admin);
  assert.equal(res.status, 403, "a normal customer cannot create products");

  await Customer.updateOne({ email: customer.email }, { role: "admin" });

  res = await post("/products", keyboard, admin);
  body = await res.json();
  assert.equal(res.status, 201, "product creation should succeed");
  const keyboardId = body.product._id;

  res = await post("/products", novel, admin);
  body = await res.json();
  assert.equal(res.status, 201, "second product creation should succeed");
  const novelId = body.product._id;

  res = await post("/products", { ...keyboard, name: undefined }, admin);
  assert.equal(res.status, 400, "missing name should be rejected");

  res = await post("/products", { ...keyboard, price: 0 }, admin);
  assert.equal(res.status, 400, "price of 0 should be rejected");

  res = await post("/products", { ...keyboard, price: -5 }, admin);
  assert.equal(res.status, 400, "negative price should be rejected");

  res = await post("/products", { ...keyboard, stock: -1 }, admin);
  assert.equal(res.status, 400, "negative stock should be rejected");

  res = await get("/products");
  body = await res.json();
  assert.equal(body.count, 2, "both products should be listed");

  res = await get("/products?search=keyboard");
  body = await res.json();
  assert.equal(body.count, 1, "search should narrow the results");
  assert.equal(body.products[0].name, keyboard.name);

  res = await get("/products?search=KEYBOARD");
  body = await res.json();
  assert.equal(body.count, 1, "search must be case-insensitive");

  res = await get("/products?category=Books");
  body = await res.json();
  assert.equal(body.count, 1, "category filter should narrow the results");
  assert.equal(body.products[0].name, novel.name);

  res = await get("/products?search=keyboard&category=Electronics");
  body = await res.json();
  assert.equal(body.count, 1, "search and category should combine");

  res = await get("/products?search=keyboard&category=Books");
  body = await res.json();
  assert.equal(body.count, 0, "conflicting filters should return nothing");

  res = await get("/products?sort=price_asc");
  body = await res.json();
  assert.equal(body.products[0].name, novel.name, "price_asc should put the cheapest first");

  res = await get("/products?sort=price_desc");
  body = await res.json();
  assert.equal(body.products[0].name, keyboard.name, "price_desc should put the dearest first");

  res = await get(`/products/${keyboardId}`);
  body = await res.json();
  assert.equal(res.status, 200, "single product should be fetchable by id");
  assert.equal(body.product.name, keyboard.name);
  assert.equal(body.product.description, keyboard.description);

  res = await get("/products/not-an-id");
  assert.equal(res.status, 400, "a malformed id should be a 400");

  res = await get("/products/507f1f77bcf86cd799439011");
  assert.equal(res.status, 404, "a valid but unknown id should be a 404");

  res = await post("/customers/login", { email: customer.email, password: customer.password });
  const session = res.headers.getSetCookie()[0].split(";")[0];

  res = await post(`/wishlist/${keyboardId}`, {});
  assert.equal(res.status, 401, "wishlist needs a login");

  res = await post(`/wishlist/${keyboardId}`, {}, session);
  assert.equal(res.status, 201, "wishlist add should succeed");

  res = await post(`/wishlist/${keyboardId}`, {}, session);
  assert.equal(res.status, 409, "saving the same product twice should be a 409");

  res = await post("/wishlist/not-an-id", {}, session);
  assert.equal(res.status, 400, "malformed id should be a 400");

  res = await post("/wishlist/507f1f77bcf86cd799439011", {}, session);
  assert.equal(res.status, 404, "unknown product should be a 404");

  res = await get("/wishlist", session);
  body = await res.json();
  assert.equal(body.count, 1, "wishlist should hold one product");
  assert.equal(body.wishlist[0].name, keyboard.name, "wishlist should be populated");

  res = await send("DELETE", `/wishlist/${keyboardId}`, null, session);
  assert.equal(res.status, 200, "wishlist remove should succeed");

  res = await send("DELETE", `/wishlist/${keyboardId}`, null, session);
  assert.equal(res.status, 404, "removing something not saved should be a 404");

  res = await send("PATCH", `/wishlist/${keyboardId}/toggle`, null, session);
  body = await res.json();
  assert.equal(body.saved, true, "toggle should save");

  res = await send("PATCH", `/wishlist/${keyboardId}/toggle`, null, session);
  body = await res.json();
  assert.equal(body.saved, false, "second toggle should unsave");

  res = await post(`/cart/${keyboardId}`, {});
  assert.equal(res.status, 401, "cart needs a login");

  res = await post(`/cart/${keyboardId}`, {}, session);
  body = await res.json();
  assert.equal(body.cart[0].quantity, 1, "first add should be quantity 1");

  res = await post(`/cart/${keyboardId}`, {}, session);
  body = await res.json();
  assert.equal(body.cart.length, 1, "adding again should not create a second row");
  assert.equal(body.cart[0].quantity, 2, "adding again should bump the quantity");

  res = await get("/cart", session);
  body = await res.json();
  assert.equal(body.cart[0].product.name, keyboard.name, "cart should be populated");

  res = await send("PATCH", `/cart/${keyboardId}`, { quantity: 11 }, session);
  assert.equal(res.status, 400, "quantity above stock should be rejected");

  res = await send("PATCH", `/cart/${keyboardId}`, { quantity: 0 }, session);
  assert.equal(res.status, 400, "quantity below 1 should be rejected");

  res = await send("PATCH", `/cart/${novelId}`, { quantity: 1 }, session);
  assert.equal(res.status, 404, "updating something not in the cart should be a 404");

  res = await send("PATCH", `/cart/${keyboardId}`, { quantity: 5 }, session);
  body = await res.json();
  assert.equal(body.cart[0].quantity, 5, "quantity update should stick");

  res = await send("DELETE", `/cart/${keyboardId}`, null, session);
  body = await res.json();
  assert.equal(body.cart.length, 0, "remove should empty the cart");

  const address = {
    fullName: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "22 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  };

  res = await post("/orders/create-payment-order", { shippingAddress: address }, session);
  assert.equal(res.status, 400, "checkout with an empty cart should be rejected");

  await post(`/cart/${keyboardId}`, {}, session);

  res = await post("/orders/create-payment-order", { shippingAddress: { ...address, pincode: "12" } }, session);
  assert.equal(res.status, 400, "a bad pincode should be rejected");

  res = await post("/orders/create-payment-order", { shippingAddress: { ...address, city: "   " } }, session);
  assert.equal(res.status, 400, "whitespace-only fields should be rejected");

  // the dummy key gets turned away by razorpay (or there's no network), either way the cart must survive
  res = await post("/orders/create-payment-order", { shippingAddress: address }, session);
  assert.equal(res.status, 502, "a payment provider failure should be a 502");
  res = await get("/cart", session);
  body = await res.json();
  assert.equal(body.cart.length, 1, "the cart must survive a payment provider failure");
  const failedOrder = await Order.findOne({ user: customerId, paymentStatus: "FAILED" });
  assert.ok(failedOrder, "the half-made order should be marked FAILED");

  await Product.updateOne({ _id: keyboardId }, { stock: 0 });
  res = await post("/orders/create-payment-order", { shippingAddress: address }, session);
  body = await res.json();
  assert.equal(res.status, 400, "stock is checked again at checkout");
  assert.match(body.message, /Insufficient stock/);
  await Product.updateOne({ _id: keyboardId }, { stock: 10 });

  // razorpay can't be reached from a test, so plant the pending order it would have created
  const pending = await Order.create({
    user: customerId,
    items: [{ product: keyboardId, name: keyboard.name, price: keyboard.price, quantity: 1 }],
    shippingAddress: address,
    totalAmount: keyboard.price,
    razorpayOrderId: "order_test123",
  });
  const paymentId = "pay_test456";
  const signature = crypto
    .createHmac("sha256", "test-razorpay-secret")
    .update("order_test123|" + paymentId)
    .digest("hex");

  res = await post(
    "/orders/verify-payment",
    { shopKartOrderId: pending._id, razorpay_payment_id: paymentId, razorpay_signature: "fake" },
    session
  );
  assert.equal(res.status, 400, "a fake signature must be rejected");

  res = await get("/cart", session);
  body = await res.json();
  assert.equal(body.cart.length, 1, "a failed verification must keep the cart");

  res = await post(
    "/orders/verify-payment",
    { shopKartOrderId: pending._id, razorpay_payment_id: paymentId, razorpay_signature: signature },
    session
  );
  body = await res.json();
  assert.equal(res.status, 200, "a real signature should verify");
  assert.equal(body.order.paymentStatus, "PAID");
  assert.equal(body.order.status, "PLACED");

  res = await get("/cart", session);
  body = await res.json();
  assert.equal(body.cart.length, 0, "a verified payment should clear the cart");

  const keyboardAfter = await Product.findById(keyboardId);
  assert.equal(keyboardAfter.stock, 9, "a verified payment should take the stock");

  res = await get("/orders", session);
  body = await res.json();
  assert.equal(body.orders.length, 1, "the paid order should be listed");

  res = await get(`/orders/${pending._id}`, session);
  assert.equal(res.status, 200, "the owner can open their order");

  await post("/customers/register", { ...customer, email: "other@gmail.com" });
  res = await post("/customers/login", { email: "other@gmail.com", password: customer.password });
  const otherSession = res.headers.getSetCookie()[0].split(";")[0];

  res = await get(`/orders/${pending._id}`, otherSession);
  assert.equal(res.status, 404, "another customer's order must stay hidden");

  res = await send("PATCH", `/orders/${pending._id}/status`, { status: "SHIPPED" }, otherSession);
  assert.equal(res.status, 403, "only admins can move an order");

  res = await send("PATCH", `/orders/${pending._id}/status`, { status: "LOST" }, session);
  assert.equal(res.status, 400, "unknown statuses should be rejected");

  res = await send("PATCH", `/orders/${pending._id}/status`, { status: "SHIPPED" }, session);
  body = await res.json();
  assert.equal(body.order.status, "SHIPPED", "admin can move an order forward");

  res = await get("/orders/admin/all", session);
  body = await res.json();
  assert.equal(body.orders.length, 1, "admin sees every placed order");

  res = await send("PATCH", "/customers/change-password", { oldPassword: "nope", newPassword: "fresh123" }, session);
  assert.equal(res.status, 401, "a wrong old password should be rejected");

  res = await send("PATCH", "/customers/change-password", { oldPassword: customer.password, newPassword: "fresh123" }, session);
  assert.equal(res.status, 200, "change password should succeed");

  res = await post("/customers/login", { email: customer.email, password: "fresh123" });
  assert.equal(res.status, 200, "the new password should work");

  res = await get("/health");
  assert.equal(res.status, 200, "health check should answer");

  res = await get("/nowhere");
  assert.equal(res.status, 404, "unknown routes should be a json 404");

  res = await fetch(BASE + "/customers/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(res.status, 400, "broken json should be a 400, not a crash");

  console.log("all checks passed");
} finally {
  server.kill();
  await mongoose.disconnect();
  await mongo.stop();
}
