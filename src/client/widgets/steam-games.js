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

    minutes_to_hours(raw_minutes) {
        const hours = Math.floor(raw_minutes / 60);
        const minutes = raw_minutes % 60;
        if (hours > 0)
            return `${hours} h ${minutes} minutes`;
        return `${minutes} minutes`;
    }

    async fetch_data() {
        try {
            const resp = await fetch(`/api/steam/games`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 500px;">
                <h4 style="text-align: center">Steam Games</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-start; max-height: 400px; overflow-y: auto; overflow-x: auto">
                    ${rest.payload.sort((a, b) => (a.playtime_forever < b.playtime_forever) ? 1 : -1).map((elem) => html`
                        <div style="display: flex; text-align: left; margin: 5px; white-space: nowrap; flex-direction: row; min-height: 32px;">
                            <img src="http://media.steampowered.com/steamcommunity/public/images/apps/${elem.appid}/${elem.img_icon_url}.jpg" style="margin-right: 5px;height: 100%;"> 
                            <div style="display: flex; text-align: left; flex-direction: column; height: 100%;">
                                <p style="margin: 0; padding: 0">${elem.name}</p>
                                <p style="margin: 0; padding: 0; font-size: 10px;"> play time : ${this.minutes_to_hours(elem.playtime_forever)}</p>
                            </div>
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
