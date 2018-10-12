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
