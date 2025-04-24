import express, { NextFunction, Response } from "express";
import { db } from "../../../database";
import bcrypt from "bcrypt";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, username, password, userId } = req.body;
    const checkUserQuery = `SELECT * FROM users WHERE username = $1 AND id != $2`;
    const { rows: users } = await db.query(checkUserQuery, [username, userId]);
    if (users.length > 0) throw { status: 409, message: "Username already exists" };

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const updateUserQuery =
      "UPDATE users set first_name=$1, last_name=$2, username=$3, password_hash=$4, email=$5 WHERE id=$6";
    await db.query(updateUserQuery, [firstName, lastName, username, passwordHash, email, userId]);

    res.json({
      success: true,
      data: {
        message: "User update successful",
      },
    });
  })
);

export default router;
