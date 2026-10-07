import jwt from "jsonwebtoken";

export const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const isProduction = process.env.NODE_ENV === "production";

// vercel and render are different sites, so in production the cookie has to be SameSite=None,
// and browsers only accept that together with Secure
export const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
