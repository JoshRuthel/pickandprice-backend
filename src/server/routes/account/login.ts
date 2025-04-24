import express, { NextFunction, Response } from "express";
import { db } from "../../../database";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const checkUserQuery = `SELECT * FROM users WHERE username = $1`;
    const { rows: users } = await db.query(checkUserQuery, [username]);
    if (users.length === 0) throw { status: 404, message: "User not found" };

    const isValidPassword = bcrypt.compareSync(password, users[0].password_hash);
    if (!isValidPassword) throw { status: 404, message: "Incorrect password" };

    const { accessToken, refreshToken } = generateTokens(users[0].id);

    res.json({
      success: true,
      data: {
        message: "Login successful",
        accessToken,
        refreshToken,
        username: users[0].username,
        userId: users[0].id,
        firstName: users[0].first_name,
        lastName: users[0].last_name,
        createdAt: users[0].created_at,
        email: users[0].email
      },
    });
  })
);

export default router;
