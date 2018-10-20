import express from "express";
import passport from "passport";
import { conn_db, pool, query_db } from "../../mysql.mjs";
import { get_user_status } from "../../utils.mjs";
import { page_bad_request, page_internal_error } from "../../errors.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/$/, async (req, res) => {
    const error = req.flash("error")[0];
    res.render("register", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/$/, async (req, res) => {
    if (req.isAuthenticated()) {
        page_bad_request(req, res);
        return;
    }

    const { username, password, password_confirm } = req.body;

    if (username == undefined || password == undefined || password_confirm == undefined) {
        req.flash("error", "A required field is missing.");
        res.redirect("/auth/register");
        return;
    }

    if (password != password_confirm) {
        req.flash("error", "The supplied passwords doesn't match.");
        res.redirect("/auth/register");
        return;
    }

    const conn = await conn_db(pool);
    try {
        const [conflict_user] = await query_db(conn, "select id from users where username = ?", [username]);
        if (conflict_user != undefined) {
            req.flash("error", "This username has already been claimed.");
            res.redirect("/auth/register");
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
