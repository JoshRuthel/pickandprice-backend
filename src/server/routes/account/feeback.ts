import express, { NextFunction, Response } from "express";
import { db } from "../../../database";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";
import nodemailer from "nodemailer";

const router = express.Router();

router.post(
  "/",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { userId, feedback } = req.body;
    const userInfoQuery = "SELECT * from users WHERE id = $1";
    const { rows: users } = await db.query(userInfoQuery, [userId]);
    const { first_name, last_name } = users[0];
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true, // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // your GoDaddy email
        pass: process.env.EMAIL_PASS, // your email password
      },
    });
    const text = "Hey Pick and Price\n\n" + feedback + `\n\nKind regards\n${first_name}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `Feedback from ${first_name} ${last_name}`,
      text: text,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error:", error);
        throw { status: 500, message: "Something went wrong delivering the feedback" };
      } else {
        res.json({ success: true });
      }
    });
  })
);

export default router;
