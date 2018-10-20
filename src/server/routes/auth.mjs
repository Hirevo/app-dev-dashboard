import express from "express";
import passport from "passport";
import auth_routes from "./auth/index.mjs";

export const router = express.Router({ caseSensitive: true });

router.use(/^\/github\/?$/, passport.authenticate("github", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "GitHub login attempt has failed.",
}));

router.use(/^\/trello\/?$/, passport.authenticate("trello", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "Trello login attempt has failed.",
}));

router.use(/^\/steam\/?$/, passport.authenticate("steam", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "Steam login attempt has failed."
}));

router.use(auth_routes);

export default router;
