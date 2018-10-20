import { html, render } from "../lit-html/lit-html.js";
import { when } from "../lit-html/directives/when.js";
import WidgetForm from "./widget-form.js";

export class WidgetPanel extends HTMLElement {
    get message() {
        return this.getAttribute("message");
    }

    get template() {
        return html`
        <div class="controller" style="display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 0px 0px 10px">
            ${when(this.message,
            () => html`<p class="custom-tag" style="background-color: var(--primary-color); color: #fff; margin: 5px">
                ${this.message}
            </p>`,
            () => html``
            )}
            <div class="select marge">
                <select name="filter" form="page-query" @change=${this.filter_change.bind(this)}>
                    <option value="" selected>None</option>
                    ${this.supported.map(({ tag }) => html`
                    <option value="${tag}">${tag}</option>`)}
                </select>
            </div>
        </div>
        <div class="grid">
            ${this.widgets.map(this.render_widget.bind(this))}
        </div>`;
    }

    constructor() {
        super();

        this.supported = [];
        this.widgets = [];
        this.tag = "";
        this.render();
        // setInterval(() => {
        //     if (this.grid)
        //         this.grid.layout().refreshItems().synchronize();
        // }, 200);
    }

    async render() {
        if (this.grid) {
            this.grid.destroy(true);
            this.grid = undefined;
        }
        const resp = await fetch("/api/widgets/current", { credentials: "same-origin" });
        if (resp.ok == false) {
            console.error("Unable to fetch widgets.");
            return;
        }

        const { type, ...rest } = await resp.json();
        if (type == "error") {
            console.error(rest.message);
            return;
        }

        const { payload: { modules, instances } } = rest;
        this.supported = await Promise.all(
            modules.map(({ path, ...rest }) =>
                import(path).then(({ default: constructor }) => ({ constructor, ...rest })))
        );
        this.widgets = instances.map(({ id, tag, data }) => {
            const widget = this.supported.find(widget => tag == widget.tag);
            if (widget == undefined)
                return undefined;
            return new widget.constructor(id, data);
        });

        render(this.template, this);
        if (this.grid == undefined)
            // @ts-ignore
            this.grid = new window.Muuri(this.querySelector(".grid"), { dragEnabled: true });
    }

    render_widget(widget, idx) {
        widget.classList.add("widget");
        return html`
        <div class="item custom-box" style="background-color: #FFF; padding: 0;" tag=${widget.tag}>
            <div class="item-content" style="display: flex; flex-direction: column; align-items: left; justify-content: center">
                <div style="display: flex; flex-direction: row-reverse; align-items: right; padding: 5px;">
                    <button class="button is-dark is-outlined" style="margin-rigth: 5px;margin-left: 5px;font-size: 10px; font-weight: bold" @click=${this.remove_widget.bind(this, idx)}>✖︎</button>
                    <button class="button is-dark is-outlined" style="margin-rigth: 5px;margin-left: 5px;font-size: 10px; font-weight: bold" @click=${this.reconfigure_widget.bind(this, idx)}>⚙︎</button>
                </div>
                ${widget}
            </div>
        </div>`;
    }

    remove_widget(idx, ev) {
        const [deleted] = this.widgets.splice(idx, 1);
        this.grid.remove(idx);
        fetch(`/api/widgets/by-id/${deleted.widget_id}`, { method: "DELETE", credentials: "same-origin" })
            .then(() => { window.location.reload(); });
    }

    reconfigure_widget(idx, ev) {
        const elem = new WidgetForm();
        elem.setAttribute("id", this.widgets[idx].widget_id);
        elem.addEventListener("render", () => window.location.reload());
        document.body.appendChild(elem);
    }

    filter_change(ev) {
        this.tag = ev.target.value;
        if (this.grid)
            if (this.tag)
                this.grid.filter(item => (item.getElement().getAttribute("tag") == this.tag));
            else
                this.grid.filter(() => true);
    }
}

window.customElements.define("widget-panel", WidgetPanel);

export default WidgetPanel;
