# ShopKart

A small store built over the ShopKart lab series: accounts, a product catalogue, wishlist, cart, and checkout through Razorpay test mode. React on the front, Express and MongoDB behind it.

The frontend is still the plain lab version for now.

## Running it locally

```bash
cd server
cp .env.example .env    # fill in Mongo, JWT secret, Razorpay test keys, Cloudinary
npm install
npm run seed            # 9 products, plus the admin account from .env
npm run dev             # http://localhost:8080

cd ../client
npm install
npm run dev             # http://localhost:5173
```

`npm test` in `server/` starts the real server against an in-memory MongoDB and runs through auth, products, wishlist, cart and orders. It doesn't talk to Razorpay. It plants a pending order and signs it with the test secret instead, so signature checking still gets exercised.

## API

Routes marked auth need the login cookie. Admin routes also need `role: "admin"` on the account, which `npm run seed` sets up.

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

`POST /products` takes either JSON with an `image` URL or multipart form data with an `image` file, which goes to Cloudinary.

## A few decisions

The JWT sits in an httpOnly cookie, so page scripts can't read it. The frontend asks `/customers/me` who is logged in instead of storing the user.

Order items copy the product's name, price and image at the time of purchase. If a price changes next month, old orders still show what was actually paid.

The server works out the order total from the database. Whatever total the browser might send is ignored. An order only becomes PAID after the Razorpay signature is checked against the order id we stored, and the cart is cleared only after that.

In production the frontend (Vercel) and API (Render) are on different sites. That means the cookie needs `SameSite=None; Secure`, which `utils/generateToken.js` switches on when `NODE_ENV=production`. Browsers that block third-party cookies (Safari, Brave, incognito windows) won't keep that cookie.
