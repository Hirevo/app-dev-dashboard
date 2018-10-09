import express from "express";
import passport from "passport";
import { get_user_status } from "../utils.mjs";

const router = express.Router({ caseSensitive: true });

router.get(/^\/github\/?$/, passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    failureMessage: "GitHub login attempt has failed. Please consider using standard login/register."
}));

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
    // TODO: Register page
});

router.post(/^\/register\/?$/, (req, res) => {
    // TODO: Register post form
    // TODO: Define interaction with existant accounts linked to other services (eg. GitHub)
});

export default router;
