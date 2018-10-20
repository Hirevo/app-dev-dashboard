import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class TrelloCards extends HTMLElement {
    static get tag() { return "trello-cards"; }
    get tag() { return TrelloCards.tag; }
    get widget_id() { return this._id; }

    get colors() {
        return {
            green: "#61bd4f",
            yellow: "#f2d600",
            orange: "#ff9f1a",
            red: "#eb5a46",
            purple: "#c377e0",
            blue: "#0079bf",
            sky: "#00c2e0"
        }
    }

    get template() {
        return html`
        <div>
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { board_name, timer }) {
        super();
        if (typeof (board_name) != "string")
            throw new Error("Missing data.");
        this._id = id;
        this.board_name = board_name;
        this.board_id = undefined;
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

    async get_board_id() {
        const resp = await fetch(`/api/trello/boards`, { credentials: "same-origin" });
        const { type, ...rest } = await resp.json();
        if (type == "error")
            throw rest.reason;
        const { payload } = rest;
        const { id } = payload.find(elem => { return elem.name == this.board_name; });
        if (id == undefined)
            throw "Unknown board";
        this.board_id = id;
        return this.id;
    }

    error_print(reason) {
        return html`
        <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            Error: ${reason}
        </h1>`;
    }

    async fetch_data() {
        try {
            await this.get_board_id();
            const resp = await fetch(`/api/trello/boards/${this.board_id}`, { credentials: "same-origin" });
            const { type, ...rest } = await resp.json();
            if (type == "error")
                throw rest.reason;
            const { payload } = rest;
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 500px;">
                <h4 style="text-align: center">${this.board_name}</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;max-height: 400px; overflow-y: auto;  overflow-x: auto">
                    ${payload.map(({ name, colors }) => html`
                    <div style="display: block; text-align: left; margin: 5px; white-space: nowrap;">
                        ${colors.map(color => html`<p class="custom-tag" style=${this.get_card_style(color)}></p>`)}
                        ${name}
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

window.customElements.define(TrelloCards.tag, TrelloCards);

export default TrelloCards;
