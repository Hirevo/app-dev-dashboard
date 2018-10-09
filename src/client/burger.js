
class Burger {
    get deployed() { return this._deployed; };
    set deployed(value) { this._deployed = value; this.invalidate(); };

    get visible() { return this._visible; };
    set visible(value) { this._visible = value; this.invalidate(); };

    constructor() {
        const get_element = (x) => {
            const elem = document.querySelector(x);
            if (!elem)
                throw new Error("Element not found");
            return elem;
        };
        this.navbar = get_element(".navbar");
        this.burger = get_element(".navbar-burger");
        this.menu = get_element(".navbar-menu");
        this._deployed = this.burger.classList.contains("is-active");
        this._visible = true;
        this.burger.addEventListener("click", () => this.toggle.call(this));
        this.invalidate();
    }

    invalidate() {
        if (this._visible)
            this.navbar.classList.remove("is-invisible");
        else
            this.navbar.classList.add("is-invisible");
        if (this._deployed) {
            this.burger.classList.add("is-active");
            this.menu.classList.add("is-active");
        } else {
            this.burger.classList.remove("is-active");
            this.menu.classList.remove("is-active");
        }
    }

    toggle() {
        this.deployed = !this._deployed;
    }
}

const burger = new Burger();
