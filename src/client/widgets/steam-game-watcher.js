import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class SteamGameWatcher extends HTMLElement {
    static get tag() { return "steam-game-watchers"; }
    get tag() { return SteamGameWatcher.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div>
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { timer, game }) {
        super();
        this._id = id;
        this.timer = timer;
        this.game = game;
        this.render();
    }

    render() {
        render(this.template, this);
        setTimeout(this.render.bind(this), this.timer);
    }

    get_status(player) {
        const real_states = [
            "Offline",
            "Online",
            "Busy",
            "Away",
            "Snooze",
            "looking to trade",
            "looking to play"
        ];
        const state = real_states[player.state] || "Unknown";
        return `${state}${player.game ? ` | ${player.game}` : ''}`;
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
            const resp = await fetch(`/api/steam/games/${this.game}`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            const game = rest.payload.game;
            rest.payload.playing = rest.payload.playing.concat(rest.payload.playing);
            rest.payload.playing = rest.payload.playing.concat(rest.payload.playing);
            rest.payload.playing = rest.payload.playing.concat(rest.payload.playing);
            const players = rest.payload.playing;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 700px;">
                <h4 style="text-align: center">${this.game}</h4>
                <img src=" http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg">
                <div style="display: flex; flex-direction: column; align-items: flex-start; max-height: 400px; overflow-y: auto; overflow-x: auto; width: 100%">
                    ${players.sort((a, b) => (a.state < b.state) ? 1 : -1).map((elem) => html`
                        <div style="display: flex; text-align: left; margin: 5px; white-space: nowrap; flex-direction: row; min-height: 32px;">
                            <img src="${elem.avatar}" style="margin-right: 5px;height: 100%;"> 
                            <div style="display: flex; text-align: left; flex-direction: column; height: 100%;">
                                <p style="margin: 0; padding: 0">${elem.name}</p>
                                <p style="margin: 0; padding: 0; font-size: 10px;"> ${this.get_status(elem)}</p>
                            </div>
                        </div>`)}
                    </div>
                </div>`;
        } catch (reason) {
            return this.error_print(reason);
        }
    }
}

window.customElements.define(SteamGameWatcher.tag, SteamGameWatcher);

export default SteamGameWatcher;
