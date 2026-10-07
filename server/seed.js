import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 30 hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://picsum.photos/seed/headphones/600/400",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with hot swappable blue switches and a detachable cable.",
    price: 2999,
    category: "Electronics",
    image: "https://picsum.photos/seed/keyboard/600/400",
    stock: 10,
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with silent clicks and an 18 month battery.",
    price: 1299,
    category: "Electronics",
    image: "https://picsum.photos/seed/mouse/600/400",
    stock: 0,
  },
  {
    name: "Cotton Casual Shirt",
    description: "Breathable full sleeve cotton shirt with a regular fit, available in navy blue.",
    price: 1499,
    category: "Fashion",
    image: "https://picsum.photos/seed/shirt/600/400",
    stock: 40,
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned soles and a breathable mesh upper.",
    price: 3499,
    category: "Fashion",
    image: "https://picsum.photos/seed/shoes/600/400",
    stock: 15,
  },
  {
    name: "Atomic Habits",
    description: "An easy and proven way to build good habits and break bad ones, by James Clear.",
    price: 499,
    category: "Books",
    image: "https://picsum.photos/seed/habits/600/400",
    stock: 60,
  },
  {
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship, by Robert C. Martin.",
    price: 899,
    category: "Books",
    image: "https://picsum.photos/seed/cleancode/600/400",
    stock: 12,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "350ml ceramic mug with a matte finish, microwave and dishwasher safe.",
    price: 349,
    category: "Home",
    image: "https://picsum.photos/seed/mug/600/400",
    stock: 80,
  },
  {
    name: "Desk Lamp",
    description: "LED desk lamp with three brightness levels and a USB charging port.",
    price: 1199,
    category: "Home",
    image: "https://picsum.photos/seed/lamp/600/400",
    stock: 22,
  },
];

try {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`Seeded ${inserted.length} products`);
} catch (error) {
  console.log("Seeding failed:", error.message);
} finally {
  await mongoose.disconnect();
}
