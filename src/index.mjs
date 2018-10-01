import express from "express";
import { config } from "./config";
import { createServer } from "http";

const app = express();
const server = createServer(app);

app.get(/^\/(?:index(?:.html)?)?\/?$/, async (req, res) => {
    res.end("Hello, World !");
});

server.listen(config.application.port, config.application.address);
