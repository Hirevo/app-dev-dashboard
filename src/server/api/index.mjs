import express from "express";
import weather_routes from "./weather.mjs";

export const router = express.Router({ caseSensitive: true });

router.use(/^\/weather/, weather_routes);

export default router;
