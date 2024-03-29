import { conn_db, pool, query_db } from "./mysql.mjs";

export async function github_strategy(req, access_token, refresh_token, profile, done) {
    const conn = await conn_db(pool);
    try {
        //? Find a perfect match
        const [perfect_match] = await query_db(conn, "select * from users where github_id = ?", [profile.id]);
        if (perfect_match) {
            await query_db(conn, "update github set access_token = ?, refresh_token = ? where user_id = ?", [access_token, refresh_token, perfect_match.id]);
            done(null, perfect_match);
            return;
        }

        if (req.isAuthenticated()) {
            await query_db(conn, "insert into github (user_id, access_token, refresh_token) values (?, ?, ?);", [req.user.id, access_token, refresh_token]);
            await query_db(conn, "update users set github_id = ? where id = ?", [profile.id, req.user.id]);
            req.user.github_id = profile.id;
            done(null, req.user);
            return;
        }

        //? else create a new user
        const new_user = {
            github_id: profile.id,
            username: profile.username || profile._json.username,
        };
        await query_db(conn, "insert into users (username, github_id) values (?, ?)", [new_user.username, new_user.github_id]);
        new_user.id = (await query_db(conn, "select id from users where github_id = ?", [new_user.github_id]))[0].id;
        await query_db(conn, "insert into github (user_id, access_token, refresh_token) values (?, ?, ?);", [new_user.id, access_token, refresh_token]);
        done(null, new_user);
    } catch (err) {
        console.error(err);
    } finally {
        conn.release();
    }
}

export async function trello_strategy(req, token, secretToken, profile, done) {
    const conn = await conn_db(pool);
    try {
        //? Find a perfect match
        const [perfect_match] = await query_db(conn, "select * from users where trello_id = ?", [profile.id]);
        if (perfect_match) {
            done(null, perfect_match);
            return;
        }

        //? add data to the connected user
        if (req.user) {
            await query_db(conn, "insert into trello (user_id, token, secret_token) values (?, ?, ?);", [req.user.id, token, secretToken]);
            await query_db(conn, "update users set trello_id = ? where id = ?", [profile.id, req.user.id]);
            req.user.trello_id = profile.id;
            done(null, req.user);
            return; 
        }

        //? else create a new user
        const new_user = {
            trello_id: profile.id,
            username: profile.username || profile._json.username,
        };
        await query_db(conn, "insert into users (username, trello_id) values (?, ?)", [new_user.username, new_user.trello_id]);
        new_user.id = (await query_db(conn, "select id from users where trello_id = ?", [new_user.trello_id]))[0].id;
        await query_db(conn, "insert into trello (user_id, token, secret_token) values (?, ?, ?);", [new_user.id, token, secretToken]);
        done(null, new_user);
    } catch (err) {
        console.error(err);
        done(null, false);
    } finally {
        conn.release();
    }
}

export async function steam_strategy(req, token, profile, done) {
    const conn = await conn_db(pool);
    try {
        //? Find a perfect match
        const [perfect_match] = await query_db(conn, "select * from users where steam_id = ?", [profile.id]);
        if (perfect_match) {
            done(null, perfect_match);
            return;
        }

        //? add data to the connected user
        if (req.user) {
            await query_db(conn, "insert into steam (user_id, token) values (?, ?);", [req.user.id, profile.id]);
            await query_db(conn, "update users set steam_id = ? where id = ?", [profile.id, req.user.id]);
            req.user.steam_id = profile.id;
            done(null, req.user);
            return; 
        }

        //? else create a new user REMOVE ??
        const new_user = {
            steam_id: profile.id,
            username: profile._json.realname,
        };
        await query_db(conn, "insert into users (username, steam_id) values (?, ?)", [new_user.username, new_user.steam_id]);
        new_user.id = (await query_db(conn, "select id from users where steam_id = ?", [new_user.steam_id]))[0].id;
        await query_db(conn, "insert into steam (user_id, token) values (?, ?);", [new_user.id, profile.id]);
        done(null, new_user);
    } catch (err) {
        console.error(err);
        done(null, false);
    } finally {
        conn.release();
    }
}