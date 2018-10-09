import mysql from "mysql";
// import * as mysql_store from "express-mysql-session"
// import * as session from "express-session";
import { config } from "./config";
// import logs, { LogLevel } from "./logs";
// import { Readable, Transform } from "stream";
// import { User } from "./types";

export const pool = mysql.createPool(config.database);

// const Store = mysql_store.call(undefined, session);
// export const store = new Store({
//     createDatabaseTable: true
// }, pool);

export function conn_db(pool) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err)
                reject(err);
            else
                resolve(conn);
        });
    });
}

export function query_db(conn, query, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(query, values, (err, results, fields) => {
            fields;
            if (err) {
                // logs.append_to_session("db-queries", LogLevel.INFO, `{ query: "${query}", values: ${JSON.stringify(values)}, err: true, code: ${err.code}, message: "${err.message}" }`);
                reject(err);
            } else {
                // logs.append_to_session("db-queries", LogLevel.INFO, `{ query: "${query}", values: ${JSON.stringify(values)}, err: false, results: ${JSON.stringify(results)} }`);
                resolve(results);
            }
        });
    });
}

export function query_namespaced_db(conn, query, values = []) {
    return new Promise((resolve, reject) => {
        conn.query({ sql: query, values, nestTables: true }, (err, results, fields) => {
            fields;
            if (err) {
                // logs.append_to_session("db-queries", LogLevel.INFO, `{ query: "${query}", values: ${JSON.stringify(values)}, err: true, code: ${err.code}, message: "${err.message}" }`);
                reject(err);
            } else {
                // logs.append_to_session("db-queries", LogLevel.INFO, `{ query: "${query}", values: ${JSON.stringify(values)}, err: false, results: ${JSON.stringify(results)} }`);
                resolve(results);
            }
        });
    });
}
