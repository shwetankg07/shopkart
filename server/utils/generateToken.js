import jwt from "jsonwebtoken";

export const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// login and logout both use this, the options have to match or clearCookie does nothing
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
