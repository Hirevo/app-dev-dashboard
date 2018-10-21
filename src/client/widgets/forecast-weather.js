import { until } from "../lit-html/directives/until.js";
import { html, render } from "../lit-html/lit-html.js";

export class ForecastWeather extends HTMLElement {
    static get tag() { return "forecast-weather"; }
    get tag() { return ForecastWeather.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <div class="content"
             style="width: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center"
        >
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
        const resp = await fetch(`/api/weather/forecast/${this.city}`, { credentials: "same-origin" });
        const { type, ...rest } = await resp.json();
        if (type == "error")
            return html`
            <h1 style="height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                Error: ${rest.reason}
            </h1>`;

        const { payload: { list } } = rest;

        const dataset = list
            .filter((val, idx) => (idx % 8 == 0));
        const labels = dataset.map(({ dt }) => {
            const date = new Date(dt * 1000);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return `${days[date.getDay()]} ${date.getDate()}`;
        });
        this.canvas = document.createElement("canvas");
        // @ts-ignore
        this.chart = new Chart(this.canvas.getContext("2d"), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Temperature",
                    data: dataset.map(({ main: { temp } }) => temp),
                    fill: false,
                    borderColor: "rgb(255, 85, 85)",
                    lineTension: 0.1
                },
                {
                    label: "Humidity",
                    data: dataset.map(({ main: { humidity } }) => humidity),
                    fill: false,
                    borderColor: "rgb(0, 133, 255)",
                    lineTension: 0.1
                }]
            },
            options: {}
        });

        return html`
        <h4 style="text-align: center">${this.city}</h4>
        ${this.canvas}`;
    }
}

window.customElements.define(ForecastWeather.tag, ForecastWeather);

export default ForecastWeather;
