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
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                <h4 style="text-align: center">${this.author}/${this.name}</h4>
                <!-- <div style="display: flex; flex-direction: column; align-items: flex-start; max-height: 400px; max-width: 500px; overflow: auto"> -->
                <div class="timeline" style="max-height: 400px; max-width: 500px; overflow: auto">
                    ${payload.map(({ author: { name, email, date }, message, avatar_url }) => html`
                        <!-- <div style="display: flex; text-align: left; margin: 5px; white-space: nowrap; flex-direction: row; min-height: 32px"> -->
                        <div class="timeline-item is-info" style="padding-bottom: 3em">
                            <div class="timeline-marker is-info"></div>
                            <div class="timeline-content" style="display: flex; text-align: left; margin: 5px; white-space: nowrap; flex-direction: row; min-height: 32px; padding: 0em 0 0 2em">
                                <div style="height: 100%; display: flex; align-items: center; justify-content: center">
                                    <img src="${avatar_url}" style="margin-right: 5px; min-width: 32px; min-height: 32px" width="32" height="32">
                                </div>
                                <div style="display: flex; text-align: left; flex-direction: column; height: 100%">
                                    <p style="margin: 0; padding: 0">${message}</p>
                                    <p style="margin: 0; padding: 0; font-size: 10px">${name} &lt;${email}&gt; | ${new Date(date).toLocaleString()}</p>
                                </div>
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
