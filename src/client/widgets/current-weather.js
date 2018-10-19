import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class CurrentWeather extends HTMLElement {
    static get tag() { return "current-weather"; }
    get tag() { return CurrentWeather.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div style="padding: 10px">
            ${this.render_body()}
        </div>`;
    }

    constructor(id, { city, timer }) {
        super();
        if (typeof (city) != "string" || typeof (timer) != "number")
            throw new Error("Missing data.");
        this._id = id;
        this.city = city;
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

    async fetch_data() {
        const resp = await fetch(`/api/weather/current/${this.city}`, { credentials: "same-origin" });
        const { type, ...rest } = await resp.json();
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
                <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: flex-start; text-align: left">
                    <h6 style="margin-bottom: 0px">Weather: ${main}</h6>
                    <h6 style="margin-bottom: 0px">Humidity: ${humidity} %</h6>
                    <h6 style="margin-bottom: 0px">Temp.: ${temp_min}-${temp_max} °C</h6>
                    <h6 style="margin-bottom: 0px">Average: ${temp} °C</h6>
                    <h6 style="margin-bottom: 0px">Wind speed: ${speed} m/s</h6>
                </div>
            </div>
        </div>`;
    }
}

window.customElements.define(CurrentWeather.tag, CurrentWeather);

export default CurrentWeather;
