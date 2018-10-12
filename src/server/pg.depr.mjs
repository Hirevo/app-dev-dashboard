import pg from "pg";
import { config } from "./config.mjs";

export const pool = new pg.Pool(config.database);

export function conn_db(pool) {
    return pool.connect();
}

export function query_db(conn, query, values = []) {
    return conn.query(query, values).then(result => result.rows);
}
