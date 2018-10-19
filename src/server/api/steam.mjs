import express from "express";
import fetch from "node-fetch";
import { authenticated_steam } from "../utils.mjs";
import { conn_db, pool, query_db } from "../mysql.mjs";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

async function getFriends(api_key, token) {
    const friends_resp = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${api_key}&steamid=${token}&format=json`);
    if (friends_resp.ok == false)
        throw {code: 500, message: "Bad response."};
    const friends_json = await friends_resp.json();
    const friends = friends_json.friendslist.friends;
    const ids = friends.map(elem => elem.steamid).join(",");
    const summaries_resp = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${api_key}&steamids=${ids}&format=json`);
    if (summaries_resp.ok == false)
        throw {code: 500, message: "Bad response."};
    const payload = await summaries_resp.json();
    const data = payload.response.players.map(({ personaname, steamid, personastate, gameid }) => ({steamid: steamid, name: personaname, state: personastate, game: gameid}));
    for (let elem of data) {
        if (elem.game) {
            const game_resp = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${api_key}&steamid=${elem.steamid}&include_appinfo=1&include_played_free_games=1&format=json`);
            if (game_resp.ok == false)
                throw {code: 500, message: "Bad response."};
            const game_json = await game_resp.json();
            const { name } = game_json.response.games.find(game => game.appid == elem.game) || {};
            elem.game = name;
        }
    }
    return data;
}

async function getGames(api_key, token) {
    const game_resp = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${api_key}&steamid=${token}&include_appinfo=1&include_played_free_games=1&format=json`);
    if (game_resp.ok == false)
            throw {code: 500, message: "Bad response."};
    const game_json = await game_resp.json();
    const data = game_json.response.games.map(({name, playtime_forever, img_logo_url, img_icon_url, appid}) => ({name, playtime_forever, img_icon_url, img_logo_url, appid}));
    return data;
}

router.get('/friends', authenticated_steam, async (req, resp) => {
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.steam;
        const [{ token }] = await query_db(conn, "select token from users join steam on users.id = steam.user_id where users.id = ?;", [req.user.id]);
        const data = await getFriends(api_key, token);
        resp.json({payload: data});
    } catch (reason) {
        if (reason.code)
            resp.status(reason.code).json({ type: "error", reason: reason.message });
        else
            resp.status(500).json({ type: "error", reason });
    } finally {
        conn.release();
    }
  });
  
router.get('/games', authenticated_steam, async (req, resp) => {
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.steam;
        const [{ token }] = await query_db(conn, "select token from users join steam on users.id = steam.user_id where users.id = ?;", [req.user.id]);
        const data = await getGames(api_key, token);
        resp.json({payload: data});
    } catch (reason) {
        if (reason.code)
            resp.status(reason.code).json({ type: "error", reason: reason.message });
        else
            resp.status(500).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

router.get(/^\/games\/(.+)\/?/, authenticated_steam, async (req, resp) => {
    const game_name = req.params[0];
    const conn = await conn_db(pool);
    try {
        const { api_key } = config.auth.steam;
        const [{ token }] = await query_db(conn, "select token from users join steam on users.id = steam.user_id where users.id = ?;", [req.user.id]);
        const games = await getGames(api_key, token);
        const friends = await getFriends(api_key, token);
        const game = games.find((game) => {return game.name == game_name});
        if (!game)
            throw {code: 404, message: "Game not found."};
        const playing = friends.filter((friend) => {
            return friend.game === game_name;
        });
        resp.json({payload: {game, playing}});
    } catch (reason) {
        if (reason.code)
            resp.status(reason.code).json({ type: "error", reason: reason.message });
        else
            resp.status(500).json({ type: "error", reason });
    } finally {
        conn.release();
    }
});

export default router;
