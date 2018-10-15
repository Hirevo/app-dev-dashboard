import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class CurrentWeather extends HTMLElement {
    constructor(city = "") {
        super();
        this.city = city;
        this.template = body => html`
            <div style="padding: 10px">
                <div class="field">
                    <input type="text" class="input is-small" style="text-align: center; font-weight: bold" placeholder="City..." value="${this.city || ''}"
                        autocomplete="off" @change=${this.inputChange.bind(this)} @keyup=${this.inputKey.bind(this)}>
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

                const {
                    payload: { name, weather: [{ main, icon }],
                    main: { temp, temp_min, temp_max, humidity },
                    wind: { speed } }
                } = rest;

                return html`
                    <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
                        <h4 style="text-align: center">${name}</h4>
                        <div style="display: flex">
                            <img src="http://openweathermap.org/img/w/${icon}.png" width="64" height="64" alt="${icon}" style="height: 100%">
                            <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: left">
                                <h6 style="margin-bottom: 0px">Weather: ${main}</h6>
                                <h6 style="margin-bottom: 0px">Humidity: ${humidity} %</h6>
                                <h6 style="margin-bottom: 0px">Temp.: ${temp_min}-${temp_max} °C</h6>
                                <h6 style="margin-bottom: 0px">Average: ${temp} °C</h6>
                                <h6 style="margin-bottom: 0px">Wind speed: ${speed} m/s</h6>
                            </div>
                        </div>
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

    inputClick(ev) {
        ev.stopPropagation();
    }
}

window.customElements.define("current-weather", CurrentWeather);

export default CurrentWeather;
