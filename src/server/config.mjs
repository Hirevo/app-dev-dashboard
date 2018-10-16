import fs from "fs";
import { base_path } from "./utils.mjs";

export const config = JSON.parse(fs.readFileSync(`${base_path}/config.json`).toString());

export default config;
