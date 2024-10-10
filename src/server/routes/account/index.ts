import express from "express";
import signup from "./signup";
import login from "./login";
import refresh from "./refresh";

const router = express.Router();
router.use("/signup", signup);
router.use("/login", login);
router.use("/refresh", refresh)

export default router;
