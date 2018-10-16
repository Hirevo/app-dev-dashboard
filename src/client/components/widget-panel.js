import { html, render } from "../lit-html/lit-html.js";

export class WidgetPanel extends HTMLElement {
    get template() {
        return html`
        <div class="controller" style="display: flex; align-items: center; justify-content: center; flex-flow: row wrap; margin: 0px 0px 10px">
            <div class="select marge">
                <select name="filter" form="page-query" @change=${this.filterChange.bind(this)}>
                    <option value="" disabled selected>Filter...</option>
                    <option value="">None</option>
                    ${this.supported
                        .map(({ tag }) => html`
                            <option value="${tag}">${tag}</option>`)}
                </select>
            </div>
        </div>
        <div class="grid">
            ${this.widgets
                .filter(widget => {
                    if (this.tag == "")
                        return true;
                    return this.tag == widget.tag;
                })
                .map(this.render_widget)
            }
        </div>`;
    }

    constructor() {
        super();

        this.supported = [];
        this.widgets = [];
        this.tag = "";
        this.render();
    }

    async render() {
        const resp = await fetch("/api/widgets");
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
            modules.map(({ tag, path }) =>
                import(path).then(({ default: constructor }) => ({ tag, constructor })))
        );
        this.widgets = instances.map(({ tag, data }) => {
            const widget = this.supported.find(widget => tag == widget.tag);
            if (widget == undefined)
                return undefined;
            return new widget.constructor(data);
        });

        render(this.template, this);

        //? Instantiate the grid layout if we're in the first-load
        if (this.grid == undefined) {
            // @ts-ignore
            this.grid = new window.Muuri(this.querySelector(".grid"), { dragEnabled: true });
        }
    }

    render_widget(widget) {
        return html`
        <div class="item custom-box" style="background-color: #FFF">
            <div class="item-content">
                ${widget}
            </div>
        </div>`;
    }

    filterChange(ev) {
        this.tag = ev.target.value;
        this.render();
    }
}

window.customElements.define("widget-panel", WidgetPanel);

export default WidgetPanel;
