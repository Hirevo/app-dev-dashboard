import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class CurrentWeather extends HTMLElement {
    constructor(city = "") {
        super();
        this.city = city;
        this.template = body => html`
            <div>
                <div class="field">
                    <input type="text" class="input is-small" style="text-align: center; font-weight: bold" placeholder="City..." value="${this.city || ''}"
                        autocomplete="false" @change=${this.inputChange.bind(this)} @keyup=${this.inputKey.bind(this)}>
                </div>
                ${body}
            </div>`;
        this.render();
    }

    render() {
        if (this.city == "") {
            const tmpl = html`
                <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    Please enter a city name...
                </h1>`;
            render(this.template(tmpl), this);
            return;
        }
        const promise = fetch(`/api/weather/current/${this.city}`)
            .then(res => res.json())
            .then(({ type, ...rest }) => {
                if (type == "error")
                    return html`
                        <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            Error: ${rest.reason}
                        </h1>`;

                const { payload: { city, icon, temp } } = rest;
                return html`
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                        <h4 class="title is-4" style="text-align: center">${city}</h4>
                        <h4 class="subtitle is-6" style="text-align: center">Temperature: ${temp}°C</h4>
                        <img src="http://openweathermap.org/img/w/${icon}.png" width="128" height="128" alt="${icon}">
                    </div>`;
            });
        const loader = html`<img src="/static/loading.gif" width="128" height="128" alt="Loading...">`;
        const body = html`${until(promise, loader)}`;
        render(this.template(body), this);
    }

    inputKey(ev) {
        if (ev.keyCode == 13)
            this.render();
    }

    inputChange(ev) {
        this.city = ev.target.value;
    }
}

window.customElements.define("current-weather", CurrentWeather);

export default CurrentWeather;
