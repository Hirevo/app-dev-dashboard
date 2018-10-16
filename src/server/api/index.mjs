import express from "express";
import weather_routes from "./weather.mjs";
import widgets_routes from "./widgets.mjs";

export const router = express.Router({ caseSensitive: true });

router.use(/^\/widgets/, widgets_routes);
router.use(/^\/weather/, weather_routes);

export default router;
