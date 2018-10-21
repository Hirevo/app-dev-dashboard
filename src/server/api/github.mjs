import express from "express";
import fetch from "node-fetch";
import { config } from "../config.mjs";
import { conn_db, pool, query_db } from "../mysql.mjs";

export const router = express.Router({ caseSensitive: true });

async function* fetch_commits(author, name, count, token) {
    const make_request = async (url, token) =>
        await fetch(url, { headers: { "Authorization": `token ${token}` } });
    const filter_fields = ({ commit: { author, message }, author: { avatar_url } }) =>
        ({ author, message: message.split("\n")[0], avatar_url });
    let page = 1;
    let fetched = 0;
    do {
        const resp = await make_request(
            `https://api.github.com/repos/${author}/${name}/commits?page=${page}`, token);
        if (resp.ok == false) {
            console.log(await resp.text());
            throw "Authentication error";
        }
        const json = await resp.json();
        if (json.length == 0)
            return;
        const rest = count - fetched;
        if (rest <= json.length) {
            yield json.splice(0, rest).map(filter_fields);
            return;
        }
        yield json.map(filter_fields);
        fetched += json.length;
        page += 1;
    } while (fetched < count);
    return;
}

router.get(/^\/commits\/([^\/]+)\/([^\/]+)\/([0-9]+)\/?/, async (req, res) => {
    const author = req.params[0];
    const name = req.params[1];
    const count = parseInt(req.params[2], 10);

    const conn = await conn_db(pool);
    try {
        const [ret] = await query_db(conn, "select access_token from users join github on github.user_id = users.id where users.id = ?", [req.user.id]);
        if (ret == undefined)
            throw "No token found.";
        const { access_token } = ret;
        const payload = await (async () => {
            let payload = [];
            for await (const chunk of fetch_commits(author, name, count, access_token))
                payload = payload.concat(...chunk);
            return payload;
        })();
        res.json({ type: "response", payload });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/forecast\/([A-Za-z]+)\/?/, async (req, res) => {
    const city = req.params[0];

    try {
        const { api_key } = config.auth.weather;
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&mode=json&units=metric&appid=${api_key}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const payload = await resp.json();
        res.json({ type: "response", payload });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    }
});

export default router;
