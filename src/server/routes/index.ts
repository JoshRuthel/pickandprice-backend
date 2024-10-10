import express from "express";
import account from "./account/index"
import job from "./job"

const router = express.Router();
router.use("/account", account);
router.use("/job", job);

export default router;
