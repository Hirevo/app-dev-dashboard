import path from "path";

export const base_path = "."; // TODO: Not sure about this.

export function get_user_status(session) {
    if (session == undefined) {
        return { logged_in: false };
    } else
        return { logged_in: true, username: session.username };
}

export function is_in_dir(dir, candidate) {
    return candidate.startsWith(dir);
}
