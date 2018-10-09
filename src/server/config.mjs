import fs from "fs";
import { base_path } from "./utils.mjs";

let file = 'config.json'

for (let i = 0; i < process.argv.length; i++) {
    if (i < process.argv.length - 1 && process.argv[i] == "--config") {
        file = process.argv[i + 1];
    }
}

export const config = JSON.parse(fs.readFileSync(`${base_path}/${file}`).toString());

export default config;
