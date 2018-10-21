import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class GithubCommits extends HTMLElement {
    static get tag() { return "github-commits"; }
    get tag() { return GithubCommits.tag; }
    get widget_id() { return this._id; }

    // get colors() {
    //     return {
    //         green: "#61bd4f",
    //         yellow: "#f2d600",
    //         orange: "#ff9f1a",
    //         red: "#eb5a46",
    //         purple: "#c377e0",
    //         blue: "#0079bf",
    //         sky: "#00c2e0"
    //     }
    // }

    get template() {
        return html`
        <div>
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { author, name, count, timer }) {
        super();
        if (typeof (author) != "string" || typeof (name) != "string")
            throw new Error("Missing data.");
        this._id = id;
        this.author = author;
        this.name = name;
        this.count = count;
        this.timer = timer;
        this.render();
    }

    render() {
        render(this.template, this);
        setTimeout(this.render.bind(this), this.timer);
    }

    render_body() {
        const loader = html`<img src="/static/loading.gif" width="128" height="128" alt="Loading...">`;
        return html`${until(this.fetch_data(), loader)}`;
    }

    error_print(reason) {
        return html`
        <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            Error: ${reason}
        </h1>`;
    }

    async fetch_data() {
        try {
            const resp = await fetch(`/api/github/commits/${this.author}/${this.name}/${this.count}`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            const { payload } = rest;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 500px;">
                <h4 style="text-align: center">${this.author}/${this.name}</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%; max-height: 400px; overflow: auto">
                    ${payload.map(({ author: { name, email, date }, message, avatar_url }) => html`
                        <div style="display: flex; flex-direction: row; justify-content: left; margin: 5px">
                            <figure class="image is-square" style="height: 100%">
                                <img src="${avatar_url}" alt="avatar">
                            </figure>
                            <div style="display: block; text-align: left; height: 100%">
                                <p style="margin: 0px">${name} | ${message}</p>
                                <p style="margin: 0px">${new Date(date).toLocaleString()}</p>
                            </div>
                        </div>`)}
                </div>
            </div>`;
        } catch (reason) {
            return this.error_print(reason);
        }
    }

    get_card_style(color) {
        return `color: white; background-color: ${color}; margin-right: 10px; padding: 5px; display: inline`;
    }
}

window.customElements.define(GithubCommits.tag, GithubCommits);

export default GithubCommits;
