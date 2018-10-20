import express from "express";
import { conn_db, pool, query_db } from "../../mysql.mjs";
import { get_user_status } from "../../utils.mjs";
import { page_internal_error } from "../../errors.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/unlink\/github\/?$/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        await query_db(conn, "update users set github_id = NULL where id = ?", [req.user.id]);
        await query_db(conn, "delete from github where user_id = ?", [req.user.id]);
        req.user.github_id = null;
        req.flash("success", "Successfully unlinked GitHub.");
        res.redirect("/auth/account");
    } catch (err) {
        console.error(err);
        page_internal_error(req, res);
    } finally {
        conn.release();
    }
});

router.get(/^\/unlink\/trello\/?$/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        await query_db(conn, "update users set trello_id = NULL where id = ?", [req.user.id]);
        await query_db(conn, "delete from trello where user_id = ?", [req.user.id]);
        req.user.trello_id = null;
        req.flash("success", "Successfully unlinked Trello.");
        res.redirect("/auth/account");
    } catch (err) {
        console.error(err);
        page_internal_error(req, res);
    } finally {
        conn.release();
    }
});

router.get(/^\/unlink\/steam\/?$/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        await query_db(conn, "update users set steam_id = NULL where id = ?", [req.user.id]);
        await query_db(conn, "delete from steam where user_id = ?", [req.user.id]);
        req.user.steam_id = null;
        req.flash("success", "Successfully unlinked Steam.");
        res.redirect("/auth/account");
    } catch (err) {
        console.error(err);
        page_internal_error(req, res);
    } finally {
        conn.release();
    }
});

router.get(/^\/$/, async (req, res) => {
    const [error] = req.flash("error");
    const [success] = req.flash("success");
    const ctx = {
        github: !!req.user.github_id,
        trello: !!req.user.trello_id,
        steam: !!req.user.steam_id
    };
    res.render("account", {
        status: get_user_status(req.user),
        ...ctx,
        link: !ctx.github || !ctx.trello || !ctx.steam,
        unlink: ctx.github || ctx.trello || ctx.steam,
        has_passwd: !!req.user.passwd,
        success,
        error
    });
});

router.post(/^\/change-passwd\/?$/, async (req, res) => {
    const { cur_passwd, new_passwd, confirm_passwd } = req.body;

    if ((cur_passwd == undefined && req.user.passwd) || new_passwd == undefined || confirm_passwd == undefined) {
        req.flash("error", "A required field is missing.");
        res.redirect("/auth/account");
        return;
    }

    if (new_passwd != confirm_passwd) {
        req.flash("error", "The supplied passwords doesn't match.");
        res.redirect("/auth/account");
        return;
    }

    if (cur_passwd != req.user.passwd) {
        req.flash("error", "Invalid current password.");
        res.redirect("/auth/account");
        return;
    }

    const conn = await conn_db(pool);
    try {
        await query_db(conn, "update users set passwd = ? where id = ?", [new_passwd, req.user.id]);
        req.user.passwd = new_passwd;
        req.flash("success", "Password successfully changed !");
        res.redirect("/auth/account");
    } catch (err) {
        console.error(err);
        page_internal_error(req, res);
    } finally {
        conn.release();
    }
});

export default router;
