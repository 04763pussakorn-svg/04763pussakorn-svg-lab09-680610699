import { Router, type Request, type Response } from "express";
import { users } from "../db/db.ts";
import { generateToken } from "../libs/jwtHelper.ts";

const router = Router();

// POST /api/login, body = { username, password }
router.post("/login", (req: Request, res: Response) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = generateToken({
      username: user.username,
      studentId: user.studentId ?? undefined,
      role: user.role,
    });

    // keep track of active tokens for this user
    user.tokens = user.tokens ? [...user.tokens, token] : [token];

    return res.status(200).json({
      success: true,
      message: "Login success",
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
