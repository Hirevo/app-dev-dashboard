import express from "express";
import fetch from "node-fetch";
import { conn_db, pool, query_db } from "../mysql.mjs";
import { authenticated_api, authenticated_trello } from "../utils.mjs";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

router.get('/boards', authenticated_api, authenticated_trello, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.trello;
        const [{ token }] = await query_db(conn, "select token, token_secret from users join trello on users.id = trello.user_id where users.id = ?;", [req.user.id]);// improve
        const url = `https://api.trello.com/1/members/me/boards?key=${api_key}&token=${token}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const payload = await resp.json();
        const boards = [];
        for (const board of payload) {
            boards.push({id: board.id, name: board.name});
        }
        res.json(boards);
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/boards\/([A-Za-z0-9]+)\/?/, authenticated_api, authenticated_trello, async (req, res) => {
    const board = req.params[0];
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.trello;
        const [{ token }] = await query_db(conn, "select token, token_secret from users join trello on users.id = trello.user_id where users.id = ?;", [req.user.id]);// improve
        const url = `https://api.trello.com/1/boards/${board}/cards?key=${api_key}&token=${token}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const payload = await resp.json();
        let cards = []
        for (let card of payload) {
            for (let user of card.idMembers)
                if (user == req.user.trello_id)
                    cards.push(card.name);
        }
        res.json(cards);
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

export default router;
