const express = require("express");
const { config } = require("./config");
const { createServer } = require("http");

const app = express();
const server = createServer(app);

app.use(express.static('public'))

server.listen(config.application.port, config.application.address);
