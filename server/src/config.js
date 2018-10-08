const { readFileSync } = require("fs");
const { base_path } = require("./utils");

let file = 'config.json'

for (let i = 0; i < process.argv.length; i++) {
    if (i <  process.argv.length - 1 && process.argv[i] == "--config") {
        file = process.argv[i + 1];
    }
}

const config = JSON.parse(readFileSync(`${base_path}/` + file).toString());

module.exports = {
    config
};
