import express from "express";
import passport from "passport";
import { get_user_status } from "../../utils.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/$/, async (req, res) => {
    const error = req.flash("error")[0];
    res.render("login", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/$/, passport.authenticate("local", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true
}));

export default router;
