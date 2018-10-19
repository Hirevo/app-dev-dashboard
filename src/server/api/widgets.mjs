import express from "express";
import { conn_db, pool, query_db, query_namespaced_db } from "../mysql.mjs";
import { authenticated_api } from "../utils.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/current\/?/, authenticated_api, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const modules = await query_db(conn,
            `select distinct widgets.tag, widgets.path from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id]);
        const instances = await query_db(conn,
            `select user_widget.id, widgets.tag, user_widget.data from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id])
            .then(fields => fields.map(({ data, ...rest }) => ({ data: JSON.parse(data), ...rest })));

        res.json({ type: "response", payload: { modules, instances } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/all\/?/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const payload = await query_db(conn,
            "select tag from widgets");
        res.json({ type: "response", payload });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/by-tag\/([a-zA-Z-_]+)\/?/, async (req, res) => {
    const tag = req.params[0];
    const conn = await conn_db(pool);
    try {
        const [widget] = await query_db(conn,
            "select * from widgets where tag = ?", [tag]);
        if (widget == undefined)
            throw "Widget not found.";

        const { params, ...rest } = widget;
        res.json({ type: "response", payload: { params: JSON.parse(params), ...rest } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/by-id\/([0-9]+)\/?/, authenticated_api, async (req, res) => {
    const id = req.params[0];
    const conn = await conn_db(pool);
    try {
        const [widget] = await query_db(conn,
            "select user_widget.data, widgets.* from user_widget join widgets on user_widget.widget_id = widgets.id where user_widget.id = ?", [id]);
        if (widget == undefined)
            throw "Widget not found.";

        const { data, params, ...rest } = widget;
        res.json({ type: "response", payload: { model: { params: JSON.parse(params), ...rest }, data: JSON.parse(data) } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.delete(/^\/by-id\/([0-9]+)\/?$/, authenticated_api, async (req, res) => {
    const id = req.params[0];
    const conn = await conn_db(pool);
    try {
        await query_db(conn,
            "delete from user_widget where id = ? and user_id = ?", [id, req.user.id]);
        res.json({ type: "response", payload: { success: true } });
    } catch (reason) {
        res.status(400).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.patch(/^\/by-id\/([0-9]+)\/?$/, authenticated_api, async (req, res) => {
    const id = req.params[0];
    const rest = req.body;
    const conn = await conn_db(pool);
    try {
        const [widget_id] = await query_db(conn, "select widget_id from user_widget where id = ?", [id]);
        if (widget_id == undefined)
            throw "Invalid ID.";

        const [widget] = await query_db(conn, "select id, tag, params from widgets where id = ?", [widget_id.widget_id]);
        if (widget == undefined)
            throw "Invalid widget.";

        const { params } = widget;
        const data = JSON.parse(params).reduce((acc, { name, type }) => {
            const transformers = {
                "string": val => val,
                "integer": val => parseInt(val, 10),
            };
            const mapping = {
                "string": val => (typeof (val) == "string"),
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
        await query_db(conn,
            "update user_widget set data = ? where id = ? and user_id = ?", [JSON.stringify(data), id, req.user.id]);
        res.json({ type: "response", payload: { success: true } });
    } catch (reason) {
        res.status(400).json({ type: "error", reason });
        throw reason;
    } finally {
        conn.release();
    }
});

export default router;
