const { readFileSync } = require("fs");
const { base_path } = require("./utils");

const config = JSON.parse(readFileSync(`${base_path}/config.json`).toString());

module.exports = {
    config
};
