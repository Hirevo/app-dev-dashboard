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
import passport_trello from "passport-trello";
import passport_steam from "passport-steam";
import path from "path";
import api_routes from "./api/index.mjs";
import { config } from "./config.mjs";
import { page_internal_error, page_not_allowed, page_not_found } from "./errors.mjs";
import { conn_db, pool, query_db } from "./mysql.mjs";
import auth_routes from "./routes/auth.mjs";
import dashboard_routes from "./routes/dashboard.mjs";
import { github_strategy, trello_strategy, steam_strategy } from "./strategies.mjs";
import { authenticated, base_path, get_user_status, is_in_dir } from "./utils.mjs";

const app = express();
const server = http.createServer(app);

app.disable("x-powered-by");

app.use(body_parser.urlencoded({ extended: false }));
app.use(flash());

app.use(session({ secret: config.application.secret, saveUninitialized: false, resave: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passport_local.Strategy((username, password, done) => {
    (async () => {
        const conn = await conn_db(pool);
        try {
            const [user] = await query_db(conn, "select * from users where username = ?", [username]);
            if (user == undefined)
                throw "No users found for the specified username.";
            if (user.passwd != password)
                throw "The submitted email/password combination was wrong.";
            done(null, user);
        } catch (message) {
            done(null, false, { message });
        } finally {
            conn.release();
        }
    });
}));

passport.use(new passport_github.Strategy({
    clientID: config.auth.github.client_id,
    clientSecret: config.auth.github.client_secret,
    callbackURL: config.auth.github.route,
    passReqToCallback: true
}, (req, access_token, refresh_token, profile, done) => {
    github_strategy(req, access_token, refresh_token, profile, done);
}));

passport.use(new passport_trello.Strategy({
    consumerKey: config.auth.trello.api_key,
    consumerSecret: config.auth.trello.client_secret,
    callbackURL: config.auth.trello.route,
    passReqToCallback: true,
    trelloParams: {
        scope: "read,write",
        name: "Dashboard",
        expiration: "never"
    }
}, (req, token, tokenSecret, profile, done) => {
    trello_strategy(req, token, tokenSecret, profile, done);
}));


passport.use(new passport_steam.Strategy({
    apiKey: config.auth.steam.api_key,
    returnURL: config.auth.steam.route,
    realm: config.auth.steam.realm,
    passReqToCallback: true
}, (req, token, profile, done) => {
    steam_strategy(req, token, profile, done);
}));

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
        .catch(() => { done(null, false); });
});

server.listen(config.application.port, config.application.address, () => {
    console.log(`🚀 📱 💻 Launched server on ${config.application.address}:${config.application.port}`);
});

app.set("view engine", "hbs");
app.set("views", `${base_path}/templates`);

hbs.registerPartials(`${base_path}/templates/partials`, () => {
    console.log("Loaded Handlebars partials !");
});

app.get(/^\/(dist|static|wasm)\/(.+)\/?$/, async (req, res) => {
    const dirs = {
        "dist": "src/client", //TODO: CHANGE THIS, NOW
        "static": "static",
        "wasm": "wasm"
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

app.use(/^\/api/, api_routes);
app.use(/^\/auth/, auth_routes);
app.use(/^\/dashboard/, authenticated, dashboard_routes);

app.get(/^\/(?:index(?:.html?)?\/?)?$/, async (req, res) => {
    res.render("index", {
        status: get_user_status(req.user),
    });
});

app.get(/^\/about.json\/?/, async (req, res) => {
    const conn = await conn_db(pool);
    try {
        const client = { host: req.ip };
        const current_time = Math.round(new Date().getTime() / 1000);
        const widgets = await query_db(conn, "select tag, service, description, params from widgets")
            .then(fields => fields.map(({ params, ...rest }) => ({ params: JSON.parse(params), ...rest })));
        const services = widgets
            .reduce((acc, { tag, description, service, params }) => {
                const widget = {
                    name: tag,
                    description,
                    params: params.map(({ name, type }) => ({ name, type }))
                };
                const found = acc.find(({ name }) => name == service);
                if (found)
                    found.widgets.push(widget);
                else
                    acc.push({ name: service, widgets: [widget] });
                return acc;
            }, []);
        const server = { current_time, services };
        res.json({ client, server });
    } catch (err) {
        console.error(err);
        page_internal_error(req, res);
    } finally {
        conn.release();
    }
});

app.use(page_not_found);

app.use((err, req, res, _) => {
    console.error(err);
    page_internal_error(req, res);
});
