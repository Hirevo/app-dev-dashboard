import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class SteamGames extends HTMLElement {
    static get tag() { return "steam-games"; }
    get tag() { return SteamGames.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div>
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
            const resp = await fetch(`/api/steam/games`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                <h4 style="text-align: center">Steam Games</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    ${rest.payload.map((elem) => html`
                        <div style="display: block; text-align: left; margin: 5px; white-space: nowrap;">
                            <img src=" http://media.steampowered.com/steamcommunity/public/images/apps/${elem.appid}/${elem.img_icon_url}.jpg">${elem.playtime_forever} ${elem.name}
                        </div>`)}
                </div>
            </div>`;
        } catch (reason) {
            return this.error_print(reason);
        }
    }
}

window.customElements.define(SteamGames.tag, SteamGames);

export default SteamGames;
