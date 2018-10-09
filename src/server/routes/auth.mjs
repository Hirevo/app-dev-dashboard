import express from "express";
import passport from "passport";
import { get_user_status } from "../utils.mjs";

const router = express.Router({ caseSensitive: true });

router.get(/^\/login\/?$/, (req, res) => {
    const error = req.flash('error')[0];
    res.render("login", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/login\/?$/, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get(/^\/logout\/?$/, (req, res) => {
    req.logout();
    res.redirect('back');
});

router.get(/^\/register\/?$/, (req, res) => {

});

export default router;
