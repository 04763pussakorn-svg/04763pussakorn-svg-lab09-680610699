import { type Response, type NextFunction } from "express";
import { type CustomRequest } from "../libs/types.ts";
import { verifyToken } from "../libs/jwtHelper.ts";
import { users } from "../db/db.ts";

// Verifies the "Authorization: Bearer <token>" header, decodes the JWT
// payload, and attaches it to req.user so downstream routes can read
// req.user.role / req.user.studentId / req.user.username.
const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: missing or malformed Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }

  // Only accept tokens that are still on the user's active token list.
  // This lets a logout / password-reset flow revoke tokens if needed.
  const user = users.find((u) => u.username === payload.username);
  if (!user || !user.tokens || !user.tokens.includes(token)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: token has been revoked",
    });
  }

  req.user = payload;
  req.token = token;
  next();
};

export default authMiddleware;
