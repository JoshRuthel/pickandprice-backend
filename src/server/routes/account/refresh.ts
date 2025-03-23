import express, { NextFunction } from "express";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../../database";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshSecret";

const router = express.Router();

//Refresh access token using refresh token
router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const checkTokenQuery = "SELECT user_id from refresh_tokens where token = $1";
    const { rows: tokens } = await db.query(checkTokenQuery, [refreshToken]);
    if (!tokens.length) throw { status: 401, message: "Refresh token does not exist" };

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err: any, user: any) => {
      if (err || !user) throw { status: 401, message: "Refresh token does not exist" };
      if (typeof user === "string") throw { status: 500, message: "Internal server error" };

      const { userId } = user;
      const accessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "15min",
      });

      res.send({ success: true, data: { accessToken } });
    });
  })
);

export default router;
