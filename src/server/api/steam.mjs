import express from "express";
import fetch from "node-fetch";
import { authenticated_steam } from "../utils.mjs";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

router.get('/friends', authenticated_steam, async (req, resp) => {
    try {
        const friends_resp = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${config.steam_key}&steamid=${req.user.id}&format=json`).then(resp => resp.json());
        const friends = friends_resp.friendslist.friends;
        const ids = friends.map(elem => elem.steamid).join(",");
        const summaries_resp = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steam_key}&steamids=${ids}&format=json`);
        const payload = await summaries_resp.json();
        const data = payload.response.players.map(({ personaname, steamid, personastate, gameid }) => ({steamid: steamid, name: personaname, state: personastate, game: gameid}));
        for (let elem of data) {
        if (elem.game) {
            const game_resp = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam_key}&steamid=${elem.steamid}&include_appinfo=1&include_played_free_games=1&format=json`).then(resp => resp.json());
            const { name } = game_resp.response.games.find(game => game.appid == elem.game) || {};
            elem.game = name;
        }
        }
        resp.json(data);
    } catch (reason) {
        resp.status(500).json({ type: "error", reason });
    }
  });
  
router.get('/games', authenticated_steam, async (req, resp) => {
    try {
        const game_resp = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam_key}&steamid=${req.user.id}&include_appinfo=1&include_played_free_games=1&format=json`).then(resp => resp.json());
        const data = game_resp.response.games.map(({name, playtime_forever, img_icon_url}) => ({name, playtime_forever, img_icon_url}));
        resp.json(data);
    } catch (reason) {
        resp.status(500).json({ type: "error", reason });
    }
});

export default router;
