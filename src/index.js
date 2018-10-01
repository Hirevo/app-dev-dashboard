const express = require("express");
const { config } = require("./config");
const { createServer } = require("http");

const app = express();
const server = createServer(app);

app.get(/^\/(?:index(?:.html)?)?\/?$/, async (req, res) => {
    res.end("Hello, World !");
});

server.listen(config.application.port, config.application.address);
