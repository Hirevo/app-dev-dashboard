import express from "express";
import fetch from "node-fetch";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/in-game\/([^/]+)\/([^/]+)\/?/, async (req, res) => {
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
        const url2 = `https://${region}.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${id}`;
        const { gameMode,  } = await make_request(url2);

        res.json({ type: "response", payload });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
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
