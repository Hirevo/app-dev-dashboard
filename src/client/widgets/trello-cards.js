import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class TrelloCards extends HTMLElement {
    static get tag() {
        return "trello-cards";
    }

    get tag() {
        return TrelloCards.tag;
    }

    get template() {
        return html`
        <div style="padding: 10px">
            ${this.render_body()}
        </div>`;
    }

    constructor({ board, board_id, timer } = { board_id : 0, board: "", timer: 30000 }) {
        super();
        this.board = board || "";
        this.board_id = board_id;
        this.timer = timer || 30000;
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

    async fetch_data() {
        const resp = await fetch(`/api/trello/boards/${this.board}`);
        const { type, ...rest } = await resp.json();
        if (type == "error")
            return html`
            <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                Error: ${rest.reason}
            </h1>`;
        return html`
        <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
            <div style="display: flex">
                ${rest.payload.map(elem => html`<p>${elem.name}</p>`)}
            </div>
        </div>`;
    }

    inputKey(ev) {
        if (ev.keyCode == 13)
            this.render();
    }

    inputChange(ev) {
        this.board = ev.target.value;
    }

    inputClick(ev) {
        ev.stopPropagation();
    }
}

window.customElements.define(TrelloCards.tag, TrelloCards);

export default TrelloCards;
