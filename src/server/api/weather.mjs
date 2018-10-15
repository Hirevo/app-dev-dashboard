import express from "express";
import fetch from "node-fetch";
import { config } from "../config.mjs";

export const router = express.Router({ caseSensitive: true });

router.get(/^\/current\/([A-Za-z]+)\/?/, async (req, res) => {
    const city = req.params[0];

    try {
        const { api_key } = config.auth.weather;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}`;
        const resp = await fetch(url);
        if (resp.ok == false)
            throw "Bad response.";
        const { weather: [{ icon }], main: { temp } } = await resp.json();
        if (icon == undefined || temp == undefined)
            return "Missing data.";
        res.json({ type: "response", payload: { city, icon, temp } });
    } catch (reason) {
        res.status(404).json({ type: "error", reason });
    }
});

export default router;
