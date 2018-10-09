import body_parser from "body-parser";
import flash from "connect-flash";
import express from "express";
import session from "express-session";
import fs from "fs";
import hbs from "hbs";
import http from "http";
import passport from "passport";
import passport_github from "passport-github";
import passport_local from "passport-local";
import path from "path";
import { config } from "./config.mjs";
import { page_internal_error, page_not_allowed, page_not_found } from "./errors.mjs";
import { conn_db, pool, query_db } from "./mysql.mjs";
import auth_routes from "./routes/auth.mjs";
import dashboard_routes from "./routes/dashboard.mjs";
import { authenticated, base_path, get_user_status, is_in_dir } from "./utils.mjs";

const app = express();
const server = http.createServer(app);

app.disable("x-powered-by");

app.use(body_parser.urlencoded({ extended: false }));
app.use(flash());

app.use(session({ secret: config.application.secret }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passport_local.Strategy((username, password, done) => {
    conn_db(pool)
        .then(conn => query_db(conn, "select * from users where username = ?", [username])
            .finally(() => conn.release()))
        .then(fields => {
            if (fields.length == 0)
                return Promise.reject("No users found for the specified username.");
            const user = fields[0];
            if (user.passwd != password)
                return Promise.reject("The submitted email/password combination was wrong.");
            console.log("Authenticated");
            done(null, user);
        })
        .catch(err => { done(null, false, { message: err }); });
}));

passport.use(new passport_github.Strategy({
    clientID: config.auth.github.client_id,
    clientSecret: config.auth.github.client_secret,
    callbackURL: config.auth.github.route
},
    (accessToken, refreshToken, profile, done) => {
        (async () => {
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
        })();
    }
));

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser((id, done) => {
    conn_db(pool)
        .then(conn => query_db(conn, "select * from users where id = ?", [id])
            .finally(() => conn.release()))
        .then(fields => {
            if (fields.length == 0)
                return Promise.reject("No users found for the specified username.");
            const user = fields[0];
            done(null, user);
        })
        .catch(err => { done(null, false); });
});

// TODO: Add more strategies ?

server.listen(config.application.port, config.application.address);

app.set("view engine", "hbs");
app.set('views', `${base_path}/templates`);

hbs.registerPartials(`${base_path}/templates/partials`, () => {
    console.log("Loaded Handlebars partials !");
});

app.get(/^\/(dist|static)\/([^/]+)\/?$/, async (req, res) => {
    const dirs = {
        "dist": "src/client", //TODO: CHANGE THIS, NOW
        "static": "static", //TODO: CHANGE THIS, NOW
    };
    const dir = dirs[req.params[0]];
    const file = `${base_path}/${dir}/${req.params[1]}`;
    const allowed = `${base_path}/${dir}/`;

    if (is_in_dir(allowed, file))
        if (fs.existsSync(file))
            res.sendFile(path.resolve(file));
        else
            page_not_found(req, res);
    else
        page_not_allowed(req, res);
});

app.use(/^\/auth/, auth_routes);

app.use(/^\/dashboard/, authenticated, dashboard_routes);

//? This handles all of: ["/", "/index", "/index/", "/index.htm", "/index.htm/", "/index.html", "/index.html/"]
app.get(/^\/(?:index(?:.html?)?\/?)?$/, async (req, res) => {
    res.render("index", {
        status: get_user_status(req.user),
    });
});

app.use(page_not_found);

app.use((err, req, res, next) => {
    console.error(err);
    page_internal_error(req, res);
});
