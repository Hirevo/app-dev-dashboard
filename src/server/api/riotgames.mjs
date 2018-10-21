import express from "express";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import fetch from "node-fetch";
import { config } from "../config.mjs";
import { authenticated_api, base_path } from "../utils.mjs";
import { resolve } from "path";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/in-game\/([^/]+)\/([^/]+)\/?/, authenticated_api, async (req, res) => {
    const region = req.params[0];
    const summoner_name = req.params[1];
    const { api_key, cache_folder, static_endpoint, version, champions, summoners } = config.auth.riotgames;
    const cache_path = resolve(`${base_path}/${cache_folder}/${version}`);
    const make_request = async (url) =>
        await fetch(url, { headers: { "X-Riot-Token": api_key } });

    const fetch_cache = async () => {
        if (existsSync(cache_path) == false) {
            mkdirSync(cache_path);
            const resp1 = await make_request(`${static_endpoint}/${version}/${champions}`);
            if (resp1.ok == false)
                throw "Couldn't populate cache";
            writeFileSync(`${cache_path}/champion.json`, await resp1.text());
            const resp2 = await make_request(`${static_endpoint}/${version}/${summoners}`);
            if (resp2.ok == false)
                throw "Couldn't populate cache";
            writeFileSync(`${cache_path}/summoner.json`, await resp2.text());
        }
        return {
            champions: JSON.parse(readFileSync(`${cache_path}/champion.json`).toString()).data,
            summoners: JSON.parse(readFileSync(`${cache_path}/summoner.json`).toString()).data,
        };
    };

    const get_player = content => ({ summonerName: name, spell1Id, spell2Id, championId }) => {
        const { image: spell1 } = Object.values(content.summoners).find(spell => parseInt(spell.key, 10) == spell1Id);
        const { image: spell2 } = Object.values(content.summoners).find(spell => parseInt(spell.key, 10) == spell2Id);
        const { image: champ } = Object.values(content.champions).find(champion => parseInt(champion.key, 10) == championId);
        return {
            name,
            spell1: `${static_endpoint}/${version}/img/${spell1.group}/${spell1.full}`,
            spell2: `${static_endpoint}/${version}/img/${spell2.group}/${spell2.full}`,
            champion: `${static_endpoint}/${version}/img/${champ.group}/${champ.full}`,
        };
    };

    try {
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
        const data = await resp2.json();
        const content = await fetch_cache();
        const get_player_bound = get_player(content);

        // const player = data.participants.find(player => player.summonerName.toLowerCase() == summoner_name.toLowerCase());
        const team1 = data.participants.filter(player => player.teamId == 100).map(get_player_bound);
        const team2 = data.participants.filter(player => player.teamId == 200).map(get_player_bound);
        const payload = {
            in_game: true,
            game_mode: data.gameMode,
            game_type: data.gameType,
            game_time: data.gameLength,
            team1, team2
        };
        res.json({ type: "response", payload });
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
