import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";
import { tns } from '../slider/tiny-slider.js';

export class LeagueRankViewer extends HTMLElement {
    static get tag() { return "league-rank-viewer"; }
    get tag() { return LeagueRankViewer.tag; }
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
        // fetch things
        return html`${until(this.fetch_data(), loader)}`;
    }

    error_print(reason) {
        return html`
        <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            Error: ${reason}
        </h1>`;
    }

    get_league_name(queue) {
        return `${queue.tier.toLowerCase().replace(/^\w/, chr => chr.toUpperCase())} ${queue.rank}`;
    }

    get_league_image(queue) {
        const src = `/static/league-rank/${queue.tier.toLowerCase()}_${queue.rank.toLowerCase()}.png`
        return html`<div style="flex: 0 0 100%; min-width: 200px; display: flex; justify-content: center; height: 200px;"><img src="${src}"></div>`;
    }

    get_components(name, value) {
        return html`<p style="margin: 5px; flex: 0 0 calc(50% - 20px); font-size: 14px;">${name} : ${value}</p>`;
    }

    get_queue_name(queue) {
        return {
            RANKED_FLEX_SR: "Flex SR",
            RANKED_SOLO_5x5: "Solo 5x5",
            RANKED_FLEX_IT: "Flex IT",
        }[queue.queueType];
    }

    get_queue_html(queue) {
        const fields = [
            this.get_components("Rank", this.get_league_name(queue)),
            this.get_components("Wins", queue.wins),
            this.get_components("Queue", this.get_queue_name(queue)),
            this.get_components("Looses", queue.losses),
            this.get_components("Inactive", queue.inactive),
            this.get_components("LP", queue.leaguePoints),
        ];
        return html`
            ${this.get_league_image(queue)}
            ${fields.map(elem => html`${elem}`)}
            `;
    }

    async fetch_data() {
        try {
            const resp = await fetch(`/api/riotgames/rank/${this.region}/${this.name}`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            const { payload } = rest;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.slider = tns({
                        container: '.slider',
                        items: payload.length,
                        slideBy: 'page',
                        autoplay: true
                    });
                });
            });
            return html`
                <div class="content" style="width: 450px; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;">
                    <h1 style="width: 100%">${this.name}</h1>
                    <div class="slider" style="width: 450px; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;">
                        ${payload.map(elem => this.get_queue_html(elem))}
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

window.customElements.define(LeagueRankViewer.tag, LeagueRankViewer);

export default LeagueRankViewer;
