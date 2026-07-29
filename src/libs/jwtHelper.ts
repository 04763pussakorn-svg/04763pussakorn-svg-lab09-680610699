import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type UserPayload } from "./types.ts";

// Get JWT_SECRET_KEY from .env file (add JWT_SECRET=<your-secret> to .env)
const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";
const JWT_EXPIRES_IN = "30m";

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, jwt_secret, { expiresIn: JWT_EXPIRES_IN });
}
