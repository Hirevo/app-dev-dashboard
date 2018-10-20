import express from "express";
import login_routes from "./login.mjs";
import register_routes from "./register.mjs";
import account_routes from "./account.mjs";
import { authenticated } from "../../utils.mjs";

export const router = express.Router({ caseSensitive: true });

router.use(/^\/login/, login_routes);
router.use(/^\/register/, register_routes);
router.use(/^\/account/, authenticated, account_routes);

router.get(/^\/logout\/?$/, async (req, res) => {
    req.logout();
    res.redirect("back");
});

router.use(async (req, res) => {
    res.status(400).json({ type: "error", reason: "Endpoint not found." });
});

export default router;
