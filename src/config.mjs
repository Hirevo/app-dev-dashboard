import { readFileSync } from "fs";
import { base_path } from "./utils"

export const config = JSON.parse(readFileSync(`${base_path}/config.json`).toString());

export default config;
