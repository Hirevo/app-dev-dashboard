import express from "express";
import fetch from "node-fetch";
import { authenticated_api } from "../utils.mjs";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/in-game\/([^/]+)\/([^/]+)\/?/, authenticated_api, async (req, res) => {
    const region = req.params[0];
    const summoner_name = req.params[1];

    try {
        const { api_key } = config.auth.riotgames;
        const make_request = async (url) =>
            await fetch(url, { headers: { "X-Riot-Token": api_key } });
        const url = `https://${region}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${summoner_name}`;
        const resp1 = await make_request(url);
        if (resp1.ok == false)
            throw "Summoner not found";
        const { id } = await resp1.json();
        const url2 = `https://${region}.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${id}`;
        const resp2 = await make_request(url2);
        if (resp2.status == 404) {
            res.json({ type: "response", payload: { in_game: false } });
            return;
        } else if (resp2.ok == false)
            throw await resp.text();
        const payload = await resp2.json();
        const player = payload.participants.find((elem) => elem.summonerName.toLowerCase() == summoner_name.toLowerCase());
        const resp = {player, gamemode: payload.gameMode, gametype: payload.gameType, gamelength: payload.gameLength};        
        res.json({ type: "response", payload: { in_game: true, ...resp } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    }
});

router.get(/^\/rank\/([^/]+)\/([^/]+)\/?/, authenticated_api, async (req, res) => {
    const region = req.params[0];
    const summoner_name = req.params[1];

    try {
        const { api_key } = config.auth.riotgames;
        const make_request = async (url) => {
            const resp = await fetch(url, { headers: { "X-Riot-Token": api_key } });
            if (resp.ok == false)
                throw "Bad response.";
            return await resp.json();
        };
        const url = `https://${region}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${summoner_name}`;
        const { id } = await make_request(url);
        const url2 = `https://${region}.api.riotgames.com/lol/league/v3/positions/by-summoner/${id}`;
        const payload = await make_request(url2);
        res.json({ type: "response", payload });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    }
});

export default router;
