import body_parser from "body-parser";
import flash from "connect-flash";
import express from "express";
import session from "express-session";
import fs from "fs";
import hbs from "hbs";
import http from "http";
import passport from "passport";
import passport_local from "passport-local";
import path from "path";
import { config } from "./config.mjs";
import { page_not_allowed, page_not_found, page_internal_error } from "./errors.mjs";
import { conn_db, pool, query_db } from "./mysql.mjs";
import auth_routes from "./routes/auth.mjs";
import dashboard_routes from "./routes/dashboard.mjs";
import { base_path, get_user_status, is_in_dir } from "./utils.mjs";
import { authenticated } from "./utils.mjs";

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
    page_internal_error(req, res);
});
