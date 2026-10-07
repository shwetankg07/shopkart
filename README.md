# ShopKart

A small online store built across the six ShopKart lab statements. You can make an account, browse and search the catalogue, save products, fill a cart, pay through Razorpay test mode and follow your orders. There's an admin panel too, for adding products (photos go to Cloudinary) and moving orders from placed to delivered.

## Stack

The frontend is React 19 on Vite, with Redux Toolkit for shared state and React Router for pages. Motion comes from GSAP, Lenis and a few React Bits components. The backend is Express 5 with Mongoose on MongoDB Atlas. Logins use a JWT in an httpOnly cookie, payments go through Razorpay and product photos are stored on Cloudinary.

## Layout

```text
server/
  config/        env check, razorpay and cloudinary setup
  models/        Customer, Product, Order
  controllers/   one file per feature
  routes/
  middlewares/   protect, adminOnly, uploads, error handling
  utils/
  seed.js        32 products plus the admin account
  test.js        runs every flow against an in-memory MongoDB

client/src/
  pages/         one file per route
  components/    shared pieces, rb/ has the React Bits ports
  store/         auth, cart, wishlist and toast slices
  services/      api.js, every request the app makes
  styles/        design tokens and base styles
```

## Running it locally

You need Node 20 or newer, a MongoDB connection string, Razorpay test keys and a Cloudinary account.

```bash
cd server
cp .env.example .env     # fill in every value
npm install
npm run seed             # wipes products, adds 32, creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev              # http://localhost:8080

cd ../client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

The server refuses to start if any variable in `.env.example` is missing, and it prints which ones.

To try a payment, check out with one of the test cards or test UPI IDs listed in Razorpay's test mode docs. Test mode never charges anything.

`npm test` inside `server/` starts the real server against an in-memory MongoDB and walks through auth, products, wishlist, cart, checkout, payment verification, admin routes and error handling. It can't open Razorpay's checkout, so it plants a pending order and signs it with the test secret, which still exercises the signature check.

## Deploying

The database is a free MongoDB Atlas cluster. Create a database user, and under Network Access allow `0.0.0.0/0`, since Render doesn't give free services a fixed IP. Put the connection string in `MONGO_URI` with `shopkart` as the database name.

The API goes on Render as a Web Service from this repo:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`
- Environment: everything from `server/.env.example`, plus `NODE_ENV=production`. Set `CLIENT_URL` to the Vercel address once you have it, with no trailing slash.

Seed the production database once from your own machine by running `npm run seed` with `MONGO_URI` pointing at Atlas.

The frontend goes on Vercel. Import the repo, set the root directory to `client` (Vercel detects Vite), and add `VITE_API_URL` with the Render address. `client/vercel.json` sends every path to `index.html`, so refreshing a page like `/products/<id>` still works.

Render's free tier puts the service to sleep after a stretch with no traffic. The first request after that takes a while, and the app shows a "waking up the store" screen until the API answers.

## How some of it works

The JWT never touches JavaScript. Login sets it as an httpOnly cookie and the browser sends it along by itself. To know who is logged in, the app asks `GET /customers/me` on load. The `protect` middleware checks the cookie on every protected route and loads the customer fresh from the database.

Vercel and Render are different sites, so in production the cookie is sent with `SameSite=None; Secure` (see `server/utils/generateToken.js`). Browsers that block third-party cookies, like Safari, Brave and most incognito windows, will drop it, and login won't stick there. Chrome, Edge and Firefox with default settings work. Putting both on one custom domain would make the cookie first-party and remove the problem.

The wishlist and cart store product ids, never copies of products, so prices and stock always come from the Product collection. An order is different. It copies each product's name, price and image at the moment of purchase, so an old order keeps showing what was actually paid.

At checkout the browser sends only the shipping address. The server reloads the cart, checks stock again, adds up the total from current prices and creates a pending order before asking Razorpay for a payment order. After payment, Razorpay's signature is checked against the order id stored on our side. Only then does the order become PAID, stock go down and the cart get cleared. A failed or cancelled payment leaves the cart alone.

The cart lives in Redux because the nav count, product cards and cart page all need the same numbers. The wishlist page fetches its own list from the API, and Redux only keeps the saved ids so the hearts and the nav count stay in sync.

## API

Routes marked auth need the login cookie. Admin routes also need `role: "admin"` on the account.

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/customers/register` | |
| POST | `/customers/login` | |
| GET | `/customers/me` | auth |
| POST | `/customers/logout` | auth |
| PATCH | `/customers/change-password` | auth |
| GET | `/products?search=&category=&sort=price_asc` | |
| GET | `/products/:id` | |
| POST | `/products` | admin |
| PUT | `/products/:id` | admin |
| DELETE | `/products/:id` | admin |
| GET | `/wishlist` | auth |
| POST | `/wishlist/:productId` | auth |
| DELETE | `/wishlist/:productId` | auth |
| PATCH | `/wishlist/:productId/toggle` | auth |
| GET | `/cart` | auth |
| POST | `/cart/:productId` | auth |
| PATCH | `/cart/:productId` | auth |
| DELETE | `/cart/:productId` | auth |
| POST | `/orders/create-payment-order` | auth |
| POST | `/orders/verify-payment` | auth |
| GET | `/orders` | auth |
| GET | `/orders/:id` | auth |
| GET | `/orders/admin/all` | admin |
| PATCH | `/orders/:id/status` | admin |
| GET | `/health` | |

`POST /products` and `PUT /products/:id` take either JSON with an `image` URL or multipart form data with an `image` file.

Product photos in the seed data are from Unsplash.
