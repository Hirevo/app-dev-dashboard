import { get_user_status } from "./utils.mjs";

export async function page_internal_error(req, res) {
    res.status(500);
    return await error_page(req, res,
        "An internal error happened !",
        "Be sure to check if the sent data is correct."
    );
}

export async function page_not_found(req, res) {
    res.status(404);
    return await error_page(req, res,
        "The page you requested wasn't found !",
        "Be sure you entered the right URL or go back to the home page."
    );
}

export async function page_not_allowed(req, res) {
    res.status(403);
    return await error_page(req, res,
        "Access Prohibited !",
        "You're not allowed to access this page !"
    );
}

export async function page_bad_request(req, res) {
    res.status(400);
    return await error_page(req, res,
        "The formulated request was incorrectly formed !",
        "Be sure all parameters were correctly setup and retry."
    );
}

export async function error_page(req, res, title, subtitle) {
    res.render("error", {
        status: get_user_status(req.user),
        error: { title, subtitle }
    });
}
