const pg = require("pg");

const pool = new pg.Pool({
    host: process.env.PG_HOST ||"localhost",
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || "dashboard",
    password: process.env.PG_PASSWD || "ji9QqN50nNZwCBlmoWPJ8GBbAQDanxPlW4NkWjlmm+OSpovnEIK0w4d+tp72wE3J",
    database: process.env.PG_DB || "dashboard"
});

function conn_db(pool) {
    return pool.connect();
}

function query_db(conn, query, values = []) {
    return conn.query(query, values).then(result => result.rows);
}

const conn = conn_db(pool);
//query_db(conn, "SELECT * FROM ")


// const express = require("express");
// const { config } = require("./config");
// const { createServer } = require("http");

// const app = express();
// const server = createServer(app);

// app.use(express.static(config.application.public_folder))
// server.listen(config.application.port, config.application.address);

