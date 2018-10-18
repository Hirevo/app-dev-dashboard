import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class TrelloCards extends HTMLElement {
    static get tag() { return "trello-cards"; }
    get tag() { return TrelloCards.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div style="padding: 10px">
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
        const { id } = rest.payload.find((elem) => { return elem.name === this.board_name; });
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
            return html`
            <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                <h4 style="text-align: center">${this.board_name}</h4>
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

window.customElements.define(TrelloCards.tag, TrelloCards);

export default TrelloCards;
