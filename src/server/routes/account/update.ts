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
    let values = [firstName, lastName, username, email]
    let updateUserQuery =
      "UPDATE users set first_name=$1, last_name=$2, username=$3,email=$4";
    let i = 5
    if(password.length){
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      updateUserQuery += ", password_hash=$5"
      values.push(passwordHash)
      i++
    }
    updateUserQuery += ` WHERE id=$${i}`
    values.push(userId)
    await db.query(updateUserQuery, values);

    res.json({
      success: true,
      data: {
        message: "User update successful",
      },
    });
  })
);

export default router;
