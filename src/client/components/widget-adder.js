import { until } from "../lit-html/directives/until.js";
import { when } from "../lit-html/directives/when.js";
import { html, render } from "../lit-html/lit-html.js";

export class WidgetAdder extends HTMLElement {
    get error() {
        return this.getAttribute("error");
    }

    get template() {
        return html`
        <form action="/dashboard/add" method="post">
            <div style="display: flex; align-items: center; justify-content: center">
                <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
                    ${when(this.error,
                        () => html`<p class="custom-tag" style="background-color: var(--danger-color); color: #fff; margin: 5px">
                            ${this.error}
                        </p>`,
                        () => html``
                    )}
                    <div class="select" style="width: 100%">
                        <select name="tag" style="width: 100%" @change=${this.filter_change.bind(this)}>
                            <option selected disabled>Select a widget...</option>
                            ${this.supported.map(({ tag }) =>
                                html`<option value="${tag}" autocomplete="off">${tag}</option>`)}
                        </select>
                    </div>
                    ${this.render_fields()}
                </div>
            </div>
        </form>`;
    }

    constructor() {
        super();

        this.supported = [];
        this.tag = "";
        this.render();
    }

    render_fields() {
        if (!this.tag)
            return [];
        const loader = html`<img src="/static/loading.gif" width="128" height="128" alt="Loading...">`;
        const promise = (async () => {
            const resp = await fetch(`/api/widgets/by-tag/${this.tag}`, { credentials: "same-origin" });
            if (resp.ok == false) {
                console.error("Unable to fetch widgets.");
                return;
            }
    
            const { type, ...rest } = await resp.json();
            if (type == "error") {
                console.error(rest.message);
                return;
            }

            const { payload: { params } } = rest;

            return html`
            ${params
                .map(({ type, ...rest }) => ({
                    type: type.replace(/^string$/, "text").replace(/^integer$/, "number"),
                    ...rest
                }))
                .map(({ display_name, name, type }) => html`
                    <div class="field" style="padding-top: 10px">
                        <label class="label">${display_name}</label>
                        <input type="${type}" class="input" placeholder="${display_name}..." name="${name}" required>
                    </div>`
                )}
            <input type="submit" value="Add" class="button is-primary is-outlined" style="margin: 5px">`;
        })();
        return html`${until(promise, loader)}`;
    }

    async render() {
        const resp = await fetch("/api/widgets/all", { credentials: "same-origin" });
        if (resp.ok == false) {
            console.error("Unable to fetch widgets.");
            return;
        }

        const { type, ...rest } = await resp.json();
        if (type == "error") {
            console.error(rest.message);
            return;
        }

        const { payload } = rest;
        this.supported = payload;

        render(this.template, this);
    }

    filter_change(ev) {
        this.tag = ev.target.value;
        this.render();
    }
}

window.customElements.define("widget-adder", WidgetAdder);

export default WidgetAdder;
