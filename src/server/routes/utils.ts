import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { db } from "../../database";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshSecret";

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: 7200,
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "2h" });
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 2);
  const id = uuid()
  const insertQuery = "INSERT into refresh_tokens (id, user_id, token, expires_at) values ($1, $2, $3, $4)";
  try {
    db.query(insertQuery, [id, userId, refreshToken, expirationTime.toDateString()]);
  } catch (e) {
    console.error(e);
  }
  return { accessToken, refreshToken };
}
