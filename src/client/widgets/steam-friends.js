import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class SteamFriends extends HTMLElement {
    static get tag() { return "steam-friends"; }
    get tag() { return SteamFriends.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div style="padding: 10px">
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { timer }) {
        super();
        this._id = id;
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
            const resp = await fetch(`/api/steam/friends`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                <h4 style="text-align: center">Steam Friends</h4>
                <div style="display: flex">
                    <ul>
                        ${rest.payload.map(elem => html`<li>${elem.name}</li>`)}
                    </ul>
                </div>
            </div>`;
        } catch (reason) {
            return this.error_print(reason);
        }
    }
}

window.customElements.define(SteamFriends.tag, SteamFriends);

export default SteamFriends;
