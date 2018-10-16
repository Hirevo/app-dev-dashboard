import { conn_db, pool, query_db } from "./mysql.mjs";

export async function github_strategy(profile, done) {
    const conn = await conn_db(pool);
    try {
        //? Find a perfect match
        const [perfect_match] = await query_db(conn, "select * from users where github_id = ?", [profile.id]);
        if (perfect_match) {
            done(null, perfect_match);
            return;
        }

        //? else fallback to username-match
        // const [username_match] = await query_db(conn, "select * from users where username = ?", [profile.username]);
        // if (username_match) {
        //     username_match.github_id = profile.id;
        //     await query_db(pool, "update users set github_id=? where id=?", [username_match.github_id, username_match.id]);
        //     done(null, email_match);
        //     return;
        // }

        //? else create a new user
        const new_user = {
            github_id: profile.id,
            username: profile.username,
            passwd: null,
        };
        await query_db(conn, "insert into users (username, github_id) values (?, ?)", [new_user.username, new_user.github_id]);
        new_user.id = (await query_db(conn, "select id from users where github_id = ?", [new_user.github_id]))[0].id;
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
            await query_db(conn, "insert into trello (user_id, token, token_secret) values (?, ?, ?);", [req.user.id, token, secretToken]);
            await query_db(conn, "update users set trello_id = ? where id = ?", [profile.id, req.user.id]);
            req.user.trello_id = profile.id;
            done(null, req.user);
        }

        //? else create a new user
        const new_user = {
            trello_id: profile.id,
            username: profile.username,
            passwd: null,
        };
        await query_db(conn, "insert into users (username, trello_id) values (?, ?)", [new_user.username, new_user.github_id]);
        new_user.id = (await query_db(conn, "select id from users where github_id = ?", [new_user.github_id]))[0].id;
        await query_db(conn, "insert into trello (user_id, token, token_secret) values (?, ?, ?);", [new_user.id, token, secretToken]);
        done(null, new_user);
    } catch (err) {
        console.error(err);
    } finally {
        conn.release();
    }
}