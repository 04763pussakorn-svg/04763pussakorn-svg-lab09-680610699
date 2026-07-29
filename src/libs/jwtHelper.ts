import jwt from "jsonwebtoken";
import { type UserPayload } from "./types.ts";

// In a real project this should come from an environment variable
// e.g. process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "lab09-secret-key";
const JWT_EXPIRES_IN = "1d";

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (err) {
    return null;
  }
}
