import express from "express";
import account from "./account/index"
import job from "./job"
import { Request, Response } from 'express'

const router = express.Router();
router.use("/account", account);
router.use("/job", job);
router.get("/healthz", async (req: Request, res: Response) => {
    res.status(200)
})

export default router;
