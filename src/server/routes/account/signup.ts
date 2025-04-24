import express, { NextFunction, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../../../database";
import { v4 as uuid } from "uuid";
import { generateTokens } from "../utils";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { firstName, lastName, username, email, password } = req.body;
    const checkUserQuery = `SELECT * FROM users WHERE username = $1`;
    const { rows: users } = await db.query(checkUserQuery, [username]);
    if (users.length > 0) throw { status: 409, message: "Username already exists" };
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const id = uuid();
    const insertUserQuery = `INSERT INTO users (id, first_name, last_name, username, email, password_hash) VALUES ($1, $2, $3, $4, $5, $6)`;
    const created_at = new Date()
    await db.query(insertUserQuery, [id, firstName, lastName, username, email, passwordHash]);

    const { accessToken, refreshToken } = generateTokens(id);

    res.json({
      sucess: true,
      data: {
        message: "Signup successful",
        accessToken,
        refreshToken,
        username,
        firstName,
        lastName,
        email,
        created_at: created_at.toDateString(),
        userId: id,
      },
    });
  })
);

export default router;
