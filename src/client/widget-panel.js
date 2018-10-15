import { html, render } from "./lit-html/lit-html.js";
import { CurrentWeather } from "./widgets/weather.js"

export class WidgetPanel extends HTMLElement {
    constructor() {
        super();
        this.widgets = [new CurrentWeather()];

        this.render_widget = widget => html`
            <div class="item custom-box" style="-webkit-backdrop-filter: blur(5px)">
                <div class="item-content">
                    ${widget}
                </div>
            </div>`;

        this.template = () => html`
            <div class="controller" style="display: flex; align-items: center; justify-content: center; flex-flow: row wrap; margin: 0px 0px 10px">
                <div class="select marge">
                    <select name="filter" form="page-query">
                        <option value="" disabled selected>Service...</option>
                        <option value="github">GitHub</option>
                        <option value="trello">Trello</option>
                        <option value="weather">Weather</option>
                    </select>
                </div>
            </div>
            <div class="grid">
                ${this.widgets.map(this.render_widget)}
            </div>
        `;
        this.render();
    }

    render() {
        render(this.template(), this);
    }
}

window.customElements.define("widget-panel", WidgetPanel);

export default WidgetPanel;
