import express from "express";
import { conn_db, pool, query_db } from "../mysql.mjs";
import { authenticated_api } from "../utils.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\//, authenticated_api, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const modules = await query_db(conn,
            `select distinct widgets.tag, widgets.path from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id]);
        const instances = await query_db(conn,
            `select widgets.tag, user_widget.data from users
                join user_widget on users.id = user_widget.user_id
                join widgets on user_widget.widget_id = widgets.id
                where users.id = ?`, [req.user.id])
            .then(fields => fields.map(({ tag, data }) => ({ tag, data: JSON.parse(data) })));

        res.json({ type: "response", payload: { modules, instances } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

export default router;
