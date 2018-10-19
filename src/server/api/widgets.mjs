import express from "express";
import { conn_db, pool, query_db } from "../mysql.mjs";
import { authenticated_api } from "../utils.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/current\/?/, authenticated_api, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const [ user ] = await query_db(conn, `select * from users where id = ?`, [req.user.id]);
        const widgets = await query_db(conn, `select tag, requirements from widgets`);
        const modules = await query_db(conn,
            `select distinct widgets.tag, widgets.path from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id]);
        const all_instances = await query_db(conn,
            `select user_widget.id, widgets.tag, user_widget.data from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id])
            .then(fields => fields.map(({ data, ...rest }) => ({ data: JSON.parse(data), ...rest })));
        const instances = all_instances.filter(elem => {
            const widget = widgets.find((widget) => { return widget.tag == elem.tag });
            return (widget && widget.requirements && user[widget.requirements]);
        });
        res.json({ type: "response", payload: { modules, instances } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/all\/?/, authenticated_api, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const [ user ] = await query_db(conn, `select * from users where id = ?`, [req.user.id]);
        const widgets = await query_db(conn, `select tag, requirements from widgets`);
        const payload = widgets.filter(widget => {
            return (!widget.requirements || widget.requirements && user[widget.requirements]);
        });
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

router.delete(/^\/instance\/([0-9]+)\/?$/, authenticated_api, async (req, res) => {
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

export default router;
