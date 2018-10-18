import express from "express";
import weather_routes from "./weather.mjs";
import widgets_routes from "./widgets.mjs";
import trello_routes from "./trello.mjs";
import steam_routes from "./steam.mjs";

export const router = express.Router({ caseSensitive: true });

router.use(/^\/widgets/, widgets_routes);
router.use(/^\/weather/, weather_routes);
router.use(/^\/trello/, trello_routes);
router.use(/^\/steam/, steam_routes);

router.use(async (req, res) => {
    res.status(400).json({ type: "error", reason: "Endpoint not found." });
});

export default router;
