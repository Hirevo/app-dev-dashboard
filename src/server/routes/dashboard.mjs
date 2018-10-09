import express from "express";
import { get_user_status } from "../utils.mjs";

const router = express.Router({ caseSensitive: true });

router.get(/^\/panel\/?$/, (req, res) => {
    res.render("panel", {
        status: get_user_status(req.user)
    });
});

export default router;
