import express from "express";
import passport from "passport";
import { page_bad_request, page_internal_error } from "../errors.mjs";
import { conn_db, query_db, pool } from "../mysql.mjs";
import { get_user_status } from "../utils.mjs";

const router = express.Router({ caseSensitive: true });

router.get(/^\/github\/?$/, passport.authenticate("github", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "GitHub login attempt has failed."
}));

router.get(/^\/trello\/?$/, passport.authenticate("trello", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "Trello login attempt has failed."
}));

router.get(/^\/steam\/?$/, passport.authenticate("steam", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/auth/login",
    failureFlash: true,
    failureMessage: "Steam login attempt has failed."
}));

router.get(/^\/login\/?$/, async (req, res) => {
    const error = req.flash("error")[0];
    res.render("login", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/login\/?$/, passport.authenticate("local", {
    successRedirect: "/dashboard/panel",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get(/^\/logout\/?$/, async (req, res) => {
    req.logout();
    res.redirect("back");
});

router.get(/^\/register\/?$/, async (req, res) => {
    const error = req.flash("error")[0];
    res.render("register", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/register\/?$/, async (req, res) => {
    if (req.isAuthenticated()) {
        page_bad_request(req, res);
        return;
    }

    const { username, password, password_confirm } = req.body;

    if (username == undefined || password == undefined || password_confirm == undefined) {
        req.flash("error", "A required field is missing.");
        res.redirect("back");
        return;
    }

    if (password != password_confirm) {
        req.flash("error", "The supplied passwords doesn't match.");
        res.redirect("back");
        return;
    }

    const conn = await conn_db(pool);
    try {
        const [conflict_user] = await query_db(conn, "select id from users where username = ?", [username]);
        if (conflict_user != undefined) {
            req.flash("error", "This username has already been claimed.");
            res.redirect("back");
            return;
        }

        await query_db(conn, "insert into users (username, passwd) values (?, ?)", [username, password]);
        const [user] = await query_db(conn, "select * from users where username = ?", [username]);

        req.login(user, err => {
            if (err)
                page_internal_error(req, res);
            else
                res.redirect("/");
        });
    } catch (err) {
        console.error(err);
    } finally {
        conn.release();
    }
});

export default router;
