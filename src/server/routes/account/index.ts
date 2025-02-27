import express from "express";
import signup from "./signup";
import login from "./login";
import refresh from "./refresh";
import template from "./template"
import shop from "./shop"

const router = express.Router();
router.use("/signup", signup);
router.use("/login", login);
router.use("/refresh", refresh)
router.use("/template", template)
router.use("/shop", shop)

export default router;
