import express from "express";
import { conn_db, pool, query_db } from "../mysql.mjs";
import { get_user_status } from "../utils.mjs";

const router = express.Router({ caseSensitive: true });

router.get(/^\/panel\/?$/, async (req, res) => {
    const message = req.flash("message")[0];
    res.render("dashboard/panel", {
        status: get_user_status(req.user),
        message
    });
});

router.get(/^\/add\/?$/, async (req, res) => {
    const error = req.flash("error")[0];
    res.render("dashboard/add", {
        status: get_user_status(req.user),
        error
    });
});

router.post(/^\/add\/?$/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const { tag, ...rest } = req.body;
        if (tag == undefined)
            throw "Missing tag.";

        const [widget] = await query_db(conn, "select id, tag, params from widgets where tag = ?", [tag]);
        if (widget == undefined)
            throw "Invalid widget.";

        const { id, params } = widget;
        const data = JSON.parse(params).reduce((acc, { name, type }) => {
            const transformers = {
                "string": val => val,
                "integer": val => parseInt(val, 10),
            };
            const mapping = {
                "string": val => (typeof(val) == "string"),
                "integer": Number.isInteger,
            };
            const elem = rest[name];
            if (elem == undefined)
                throw "Invalid parameters.";
            
            const param = transformers[type](elem);
            if (mapping[type](param) == false)
                throw "Invalid parameters.";

            acc[name] = param;
            return acc;
        }, {});

        await query_db(conn, "insert into user_widget (user_id, widget_id, data) values (?, ?, ?)", [req.user.id, id, JSON.stringify(data)]);
        req.flash("message", "The widget has been successfully added !");
        res.redirect("/dashboard/panel");
    } catch (reason) {
        console.error(JSON.stringify(reason));
        req.flash("error", "The widget has been successfully added !");
        res.redirect("/dashboard/add");
    } finally {
        conn.release();
    }
});

export default router;
