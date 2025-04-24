import express from "express";
import signup from "./signup";
import login from "./login";
import refresh from "./refresh";
import template from "./template"
import shop from "./shop"
import feedback from "./feeback"
import update from "./update"

const router = express.Router();
router.use("/signup", signup);
router.use("/login", login);
router.use("/refresh", refresh)
router.use("/template", template)
router.use("/shop", shop)
router.use("/feedback", feedback)
router.use("/update", update)

export default router;
