import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";
import { ifDefined } from "../lit-html/directives/if-defined.js";

export class WidgetForm extends HTMLElement {
    static get observedAttributes() { return ["id"]; }

    get template() {
        return html`
        <style>
            .main-modal {
                background-color: #000A;
                padding: 20px; width: unset;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
        </style>
        <form @submit=${this.submit_form.bind(this)}>
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-content main-modal">
                    ${this.render_fields()}
                </div>
                <button class="modal-close is-large"></button>
            </div>
        </form>`;
    }

    constructor() {
        super();
        this._id = this.getAttribute("id");
    }

    connectedCallback() {
        this.render();
    }

    get widget_id() {
        return this._id;
    }
    set widget_id(id) {
        this._id = id;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (WidgetForm.observedAttributes.includes(name))
            this[`_${name}`] = newValue;
    }

    async render_fields() {
        if (!this._id)
            return [];
        const loader = html`<img src="/static/loading.gif" width="128" height="128" alt="Loading...">`;
        const promise = (async () => {
            const resp = await fetch(`/api/widgets/by-id/${this.id}`, { credentials: "same-origin" });
            if (resp.ok == false) {
                console.error(`Unable to fetch widget (id: ${this._id}).`);
                return;
            }

            const { type, ...rest } = await resp.json();
            if (type == "error") {
                console.error(rest.message);
                return;
            }

            const { payload: { model: { params }, data } } = rest;

            return html`
            ${params
                .map(({ type, ...rest }) => ({
                    type: type.replace(/^string$/, "text").replace(/^integer$/, "number"),
                    ...rest
                }))
                .map(({ display_name, name, type, vals }) => {
                    if (Array.isArray(vals))
                        return html`
                        <div class="control" style="padding-top: 10px; width: 100%">
                            <label class="label">${display_name}</label>
                            <div class="select" style="width: 100%">
                                <select name="${name}" style="width: 100%" required>
                                    <option disabled ?selected=${data[name]==undefined}>${display_name}...</option>
                                    ${vals.map(elem => html`
                                        <option value="${elem}" ?selected=${data[name]==elem}>${elem}</option>`)}
                                </select>
                            </div>
                        </div>`;
                    return html`
                    <div class="field" style="padding-top: 10px">
                        <label class="label" style="color: #FFF">${display_name}</label>
                        <input type="${type}" class="input" placeholder="${display_name}..." name="${name}" value="${data[name]}" required>
                    </div>`;
                })}
            <input type="submit" value="Alter" class="button is-primary is-outlined" style="margin: 5px">`;
        })();

        return html`${until(promise, loader)}`;
    }

    async render() {
        render(this.template, this);
    }

    submit_form(ev) {
        ev.preventDefault();
        const form = new FormData(this.getElementsByTagName("form")[0]);
        const data = Array.from(form.entries()).reduce((acc, cur) => ({
            ...acc,
            [cur[0]]: cur[1],
        }), {});
        const body = JSON.stringify(data);
        fetch(`/api/widgets/by-id/${this._id}`, { method: "PATCH", body, headers: { "Content-Type": "application/json" } })
            .then(resp => { this.dispatchEvent(new Event("render", { bubbles: true })); this.remove(); });
    }
}

window.customElements.define("widget-form", WidgetForm);

export default WidgetForm;
