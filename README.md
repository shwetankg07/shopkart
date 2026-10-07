# ShopKart

Labs 1 and 2: customer auth API and the React login flow.

```bash
cd server && cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install && npm run dev          # http://localhost:8080

cd client && npm install && npm run dev   # http://localhost:5173
```

`npm test` in `server/` runs the auth flow against an in-memory MongoDB.

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/customers/register` | no |
| POST | `/customers/login` | no |
| GET | `/customers/me` | yes |
| POST | `/customers/logout` | yes |
