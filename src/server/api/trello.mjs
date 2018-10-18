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
        const [{ token }] = await query_db(conn, "select token, secret_token from users join trello on users.id = trello.user_id where users.id = ?;", [req.user.id]);
        const url = `https://api.trello.com/1/members/me/boards?key=${api_key}&token=${token}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const payload = await resp.json();
        const boards = [];
        for (const board of payload) {
            boards.push({id: board.id, name: board.name});
        }
        res.json({type: "response", payload: boards });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

async function getBoardLabels(board, api_key, token) {
    const url = `https://api.trello.com/1/boards/${board}/labels/?fields=color&key=${api_key}&token=${token}`;
    const resp = await fetch(url);
    if (resp.ok == false)
        throw "Bad response.";
    const payload = await resp.json();
    return payload;
}

router.get(/^\/boards\/([A-Za-z0-9]+)\/?/, authenticated_api, authenticated_trello, async (req, res) => {
    const board = req.params[0];
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.trello;
        const [{ token }] = await query_db(conn, "select token, secret_token from users join trello on users.id = trello.user_id where users.id = ?;", [req.user.id]);
        const url = `https://api.trello.com/1/boards/${board}/cards?key=${api_key}&token=${token}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const payload = await resp.json();
        const labelsColors = await getBoardLabels(board, api_key, token);
        const cards = [];
        let colors = [];
        for (const card of payload) {
            for (const user of card.idMembers)
                if (user == req.user.trello_id) {
                    colors = [];
                    for (const label of card.idLabels)
                        colors.push(labelsColors.find((elem) => {return elem.id == label}));
                    colors = colors.map((elem) => elem.color);
                    cards.push({name: card.name, colors: colors});
                }
        }
        res.json({ type: "response", payload: cards });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

export default router;
