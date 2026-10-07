import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Product from "./models/product.model.js";
import Customer from "./models/customer.model.js";

dotenv.config();

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const products = [
  {
    name: "Studio Over-Ear Headphones",
    description: "Closed-back wireless headphones with active noise cancelling and around 30 hours of battery.",
    price: 4999,
    category: "Electronics",
    image: photo("1505740420928-5e560c06d30e"),
    stock: 25,
  },
  {
    name: "Instant Film Camera",
    description: "Point, shoot and hold the print a minute later. Takes standard instant film packs.",
    price: 8499,
    category: "Electronics",
    image: photo("1526170375885-4d8ecf77b99f"),
    stock: 12,
  },
  {
    name: "Slim Wireless Keyboard",
    description: "Low-profile keys, Bluetooth, and a battery that charges over USB-C.",
    price: 2799,
    category: "Electronics",
    image: photo("1587829741301-dc798b83add3"),
    stock: 30,
  },
  {
    name: "Wireless Mouse",
    description: "Quiet clicks, a 2.4 GHz receiver that lives inside the mouse, and one AA battery for months.",
    price: 1299,
    category: "Electronics",
    image: photo("1527864550417-7fd91fc51a46"),
    stock: 40,
  },
  {
    name: "13-inch Laptop",
    description: "Light aluminium laptop with 16 GB memory, 512 GB SSD and an all-day battery.",
    price: 64999,
    category: "Electronics",
    image: photo("1496181133206-80ce9b88a853"),
    stock: 6,
  },
  {
    name: "Smartphone 128 GB",
    description: "6.1-inch display, dual camera and fast charging. Unlocked.",
    price: 34999,
    category: "Electronics",
    image: photo("1511707171634-5f897ff02aa9"),
    stock: 10,
  },
  {
    name: "Smartwatch",
    description: "Heart rate, sleep tracking and notifications on your wrist. Water resistant to 50 m.",
    price: 12999,
    category: "Electronics",
    image: photo("1546868871-7041f2a55e12"),
    stock: 14,
  },
  {
    name: "Portable Speaker",
    description: "Waterproof Bluetooth speaker that runs for 12 hours on a charge.",
    price: 5499,
    category: "Electronics",
    image: photo("1608043152269-423dbba4e7e1"),
    stock: 22,
  },
  {
    name: "Wireless Earbuds",
    description: "Small charging case, clear calls, and about 5 hours of listening per charge.",
    price: 9999,
    category: "Electronics",
    image: photo("1592921870789-04563d55041c"),
    stock: 18,
  },
  {
    name: "Red Running Shoes",
    description: "Light knit upper and a springy foam sole for daily runs.",
    price: 5999,
    category: "Fashion",
    image: photo("1542291026-7eec264c27ff"),
    stock: 16,
  },
  {
    name: "Everyday Trainers",
    description: "Grey mesh trainers that go with almost everything.",
    price: 4499,
    category: "Fashion",
    image: photo("1491553895911-0055eca6402d"),
    stock: 20,
  },
  {
    name: "Classic Sunglasses",
    description: "Black acetate frame with UV400 lenses.",
    price: 1899,
    category: "Fashion",
    image: photo("1572635196237-14b3f281503f"),
    stock: 35,
  },
  {
    name: "Everyday Backpack",
    description: "20 litres, a padded laptop sleeve and a water-resistant base.",
    price: 2499,
    category: "Fashion",
    image: photo("1553062407-98eeb64c6a62"),
    stock: 28,
  },
  {
    name: "Plain White Tee",
    description: "Heavyweight cotton, regular fit, holds its shape after washing.",
    price: 699,
    category: "Fashion",
    image: photo("1521572163474-6864f9cf17ab"),
    stock: 60,
  },
  {
    name: "Pullover Hoodie",
    description: "Brushed fleece inside, kangaroo pocket, grey marl.",
    price: 1999,
    category: "Fashion",
    image: photo("1556821840-3a63f95609a7"),
    stock: 24,
  },
  {
    name: "Suede Brogues",
    description: "Teal suede brogues on a gum sole.",
    price: 3999,
    category: "Fashion",
    image: photo("1560343090-f0409e92791a"),
    stock: 9,
  },
  {
    name: "Analog Watch",
    description: "Rose-gold case, white dial and a black leather strap.",
    price: 6499,
    category: "Fashion",
    image: photo("1593998066526-65fcab3021a2"),
    stock: 11,
  },
  {
    name: "Minimal White Watch",
    description: "Matte white case and silicone strap. Nothing on the dial you don't need.",
    price: 3299,
    category: "Fashion",
    image: photo("1523275335684-37898b6baf30"),
    stock: 15,
  },
  {
    name: "Milk and Honey",
    description: "Rupi Kaur's poetry collection about love, loss and healing. Paperback.",
    price: 399,
    category: "Books",
    image: photo("1544947950-fa07a98d237f"),
    stock: 50,
  },
  {
    name: "How Innovation Works",
    description: "Matt Ridley on where new ideas actually come from. Paperback.",
    price: 549,
    category: "Books",
    image: photo("1589829085413-56de8ae18c73"),
    stock: 30,
  },
  {
    name: "Startup Reading Stack",
    description: "Six well-thumbed business books on building companies, sold as a set.",
    price: 1999,
    category: "Books",
    image: photo("1512820790803-83ca734da794"),
    stock: 8,
  },
  {
    name: "Weekend Reading Bundle",
    description: "Three short novels picked for a slow weekend.",
    price: 899,
    category: "Books",
    image: photo("1543002588-bfa74002ed7e"),
    stock: 20,
  },
  {
    name: "Classic Novels Set",
    description: "Ten hardback classics with matching spines.",
    price: 2499,
    category: "Books",
    image: photo("1495446815901-a7297e633e8d"),
    stock: 7,
  },
  {
    name: "Grey Desk Lamp",
    description: "Adjustable arm and head, takes a standard E27 bulb.",
    price: 2299,
    category: "Home",
    image: photo("1507473885765-e6ed057f782c"),
    stock: 19,
  },
  {
    name: "White Ceramic Mug",
    description: "350 ml, dishwasher safe, sits well in the hand.",
    price: 349,
    category: "Home",
    image: photo("1514228742587-6b1558fcca3d"),
    stock: 80,
  },
  {
    name: "Succulent in Pot",
    description: "A hardy aloe in a mint ceramic pot. Water it every two weeks.",
    price: 449,
    category: "Home",
    image: photo("1485955900006-10f4d324d411"),
    stock: 26,
  },
  {
    name: "Wooden Stool",
    description: "Solid ash, 45 cm tall, works as a seat or a side table.",
    price: 2999,
    category: "Home",
    image: photo("1503602642458-232111445657"),
    stock: 10,
  },
  {
    name: "Scented Candle",
    description: "Soy wax in a glass jar, about 40 hours of burn time.",
    price: 599,
    category: "Home",
    image: photo("1602874801007-bd458bb1b8b6"),
    stock: 45,
  },
  {
    name: "Linen Sofa",
    description: "Three-seater in oat linen with removable covers.",
    price: 38999,
    category: "Home",
    image: photo("1578500494198-246f612d3b3d"),
    stock: 3,
  },
  {
    name: "Soft Pillow",
    description: "Hollowfibre fill with a cotton cover. 45 by 70 cm.",
    price: 899,
    category: "Home",
    image: photo("1584100936595-c0654b55a2e2"),
    stock: 38,
  },
  {
    name: "Grey Armchair",
    description: "Upholstered armchair on solid oak legs.",
    price: 11499,
    category: "Home",
    image: photo("1598300042247-d088f8ab3a91"),
    stock: 5,
  },
  {
    name: "Green Velvet Sofa",
    description: "Deep-seat three-seater in bottle-green velvet.",
    price: 45999,
    category: "Home",
    image: photo("1555041469-a586c61ea9bc"),
    stock: 2,
  },
];

// admin details come from .env so no password ever lives in the repo
const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin");
    return;
  }

  const existing = await Customer.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`${ADMIN_EMAIL} is now an admin`);
    return;
  }

  await Customer.create({
    fullName: "ShopKart Admin",
    email: ADMIN_EMAIL,
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    phone: "0000000000",
    role: "admin",
  });
  console.log(`Created admin ${ADMIN_EMAIL}`);
};

try {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`Seeded ${inserted.length} products`);
  await seedAdmin();
} catch (error) {
  console.log("Seeding failed:", error.message);
} finally {
  await mongoose.disconnect();
}
