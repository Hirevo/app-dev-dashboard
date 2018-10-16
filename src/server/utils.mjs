import { page_not_allowed } from "./errors.mjs";

export const base_path = "."; // TODO: Not sure about this. (but should we parse 'import.meta.url' ?)

export function get_user_status(session) {
    if (session == undefined) {
        return { logged_in: false };
    } else
        return { logged_in: true, username: session.username };
}

export function is_in_dir(dir, candidate) {
    return candidate.startsWith(dir);
}

export function authenticated(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        page_not_allowed(req, res);
}

export function authenticated_api(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        res.status(403).json({ type: "error", message: "Endpoint requires authentication." });
}

export function authenticated_github(req, res, next) {
    if (req.user.github_id)
        next();
    else
        res.status(403).json({ type: "error", message: "Endpoint requires github authentication." });
}

export function authenticated_steam(req, res, next) {
    if (req.user.steam_id)
        next();
    else
        res.status(403).json({ type: "error", message: "Endpoint requires steam authentication." });
}

export function authenticated_trello(req, res, next) {
    if (req.user.trello_id)
        next();
    else
        res.status(403).json({ type: "error", message: "Endpoint requires trello authentication." });
}
