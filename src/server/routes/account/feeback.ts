import express, { NextFunction,Response } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../../database";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { userId, feedback } = req.body;
    const id = uuid();
    const createdAt = new Date()
    const saveQuery = "INSERT into feedback (id, user_id, feedback, created_at) values ($1, $2, $3, $4)";
    await db.query(saveQuery, [id, userId, feedback, createdAt.toDateString()]);
    res.json({ success: true });
  })
);

export default router