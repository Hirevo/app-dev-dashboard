import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class LeagueInGame extends HTMLElement {
    static get tag() { return "league-in-game"; }
    get tag() { return LeagueInGame.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div>
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { name, region, timer }) {
        super();
        if (typeof (name) != "string" || typeof (region) != "string")
            throw new Error("Missing data.");
        this._id = id;
        this.name = name;
        this.region = region;
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

    gen_player(player) {
        return html`
            <div style="display: flex; flex-direction: row;">
                <img style="padding: 3px; width: 64px; height: 64px" src="${player.champion}">
                <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
                    <p style="padding: 0px 5px; width: 100%; margin: 0; text-align: left;">${player.name}</p>
                    <img style="padding: 0px 5px; width: 40px; height: 40px" src="${player.spell1}">
                    <img style="padding: 0px 5px; width: 40px; height: 40px" src="${player.spell2}">
                </div>
            </div>
        `
    }

    gen_team(team) {
        return html`
            <div style="display: flex; flex-direction: column;">
                ${team.map(player => html`${this.gen_player(player)}`)}
            </div>
        `;
    }

    mode_beautifier(mode) {
        const capitalized = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
        return capitalized.replace(/\W|_/g, ' ');
    }

    get_time_elapsed(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        if (minutes > 0)
            return `${minutes} minutes ${seconds} seconds`;
        return `${seconds} seconds`;            
    }

    async fetch_data() {
        try {
            const resp = await fetch(`/api/riotgames/in-game/${this.region}/${this.name}`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            const { payload } = rest;
            if (!payload.in_game)
                return html`
                <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${this.name} isn't playing at the moment.
                </h1>`;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 700px;">
                <div id="#header">
                    <h3 style="text-align: center">${this.mode_beautifier(payload.game_mode)} ${this.mode_beautifier(payload.game_type)}</h3>
                    <p style="text-align: center">${this.get_time_elapsed(payload.game_time)}</p>
                </div>
                <div id="body" style="display: flex; flex-direction: row; max-width: 700px;">
                    ${this.gen_team(payload.team1)}
                    ${this.gen_team(payload.team2)}
                </div>
            </div>`;
        } catch (reason) {
            return this.error_print(reason);
        }
    }
}

window.customElements.define(LeagueInGame.tag, LeagueInGame);

export default LeagueInGame;
