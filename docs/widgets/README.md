# Widgets

This document covers the creation of new widgets from both client and server sides.

## Introduction

Widgets are implemented using **`Custom Elements`**, a browser-native API allowing pages to define their own HTML elements, defined and implemented by user-side Javascript.

This makes the following possible:
```html
<script type="module">
export class MyShinyElement extends HTMLElement {
    constructor() {
        super();

        // This uses another browser feature called ShadowDOM (or ShadowRoot)
        // It's not used in this project because Bulma's styles are used
        // But good practices promote using ShadowDOM to cause better encapsulation of styles
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const h1 = document.createElement("h1");
        h1.innerHTML = "I'm a shiny custom element";
        this.shadowRoot.appendChild(h1);
    }
}

window.customElements.define("my-shiny-element", MyShinyElement);

export default MyShinyElement;
</script>

<!-- The following becomes valid HTML -->
<!-- The browser will populate it when it becomes defined -->
<my-shiny-element></my-shiny-element>
```

Each widget is a Custom Element uniquely identified by its tag.  
The server serves the widgets tag and module paths needed.  
The client then lazy-loads (using dynamic **`import()`**) each widget and instanciates them with different data obtained from the server.  
Each widget module is loaded once but can be instanciated many times.  

## Client-side

Widgets are implemented in the `src/client/widgets` folder.  

Widgets are hydrated using [**`lit-html`**](https://github.com/Polymer/lit-html), a library for lightweight and native client-side templating (backed up by the **`Polymer`** project).

Here is the typical example of a widget:
```javascript
import { html, render } from "/dist/lit-html/lit-html.js";

export class MyFancyWidget extends HTMLElement {

    //! These three getters are REQUIRED for the panel to work correctly
    static get tag() { return "fancy-widget"; }
    get tag() { return MyFancyWidget.tag; }
    get widget_id() { return this._id; }

    get template() {
        return html`
        <h1 style="text-align: center">
            I'm a widget tagged '${this.tag}'
        </h1>`;
    }

    constructor(id, { timer }) {
        super();

        //! Don't forget to store the instance ID in this._id
        this._id = id;

        this.timer = timer;
    }

    connectedCallback() {
        this.render();
        setInterval(this.render.bind(this), this.timer);
    }

    render() {
        render(this.template, this);
    }
}

window.customElements.define(MyFancyWidget.tag, MyFancyWidget);

export default MyFancyWidget;
```

After that, the sky's the limit.  
It's up to you to implement all the things a widget might want to do.

## Server-side

On the server-side, widgets are served from `/dist/widgets/`.  
They must be registered in the database (See the database documentation about the **`widgets`** table for the schema).  

Widgets accept different parameters which allows them to customize their behavior and are passed as an object to the second argument of the widget's constructor.  
Widget parameters are specified in the **`params`** field of the **`widgets`** database table.  
The field is a JSON string representing an array of the following object:
```json
{
    "name": "city", // This is the name of the parameter
    "display_name": "City name", // This is a name suited to be displayed to the user
    "type": "string", // This is the type of parameter, supported types are "string" and "integer"
    "vals": [ "Strasbourg", "Tokyo" ] // This is optional and allows to show a dropdown instead of a raw input to the user
}
```

From there, everything else is handled for you by the system:
- The widget is added to the /about.json route.
- The instances will be tracked and saved by the server.
- The widget is available for creation and reconfiguration on the client-side.
- Necessary linkages to services will be checked by the server.
- Parameter inputs will be checked at configuration times by the server.
