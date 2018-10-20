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

    get_status(player) {
        const real_states = {
            0: "Offline",
            1: "Online",
            2: "Busy",
            3: "Away",
            4: "Snooze",
            5: "looking to trade",
            6: "looking to play"
        }
        const state = real_states[player.state] || "Unknown";
        if (player.game)
            return `${state} | ${player.game}`;
        return `${state}`;
    }

    async fetch_data() {
        try {
            const resp = await fetch(`/api/steam/friends`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 500px;">
                <h4 style="text-align: center">Steam Friends</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-start; max-height: 400px; overflow-y: auto; overflow-x: auto">
                    ${rest.payload.sort((a, b) => (a.state < b.state) ? 1 : -1).map((elem) => html`
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

window.customElements.define(SteamFriends.tag, SteamFriends);

export default SteamFriends;
