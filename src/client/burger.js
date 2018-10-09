
class Burger {
    get deployed() { return this._deployed; };
    set deployed(value) { this._deployed = value; this.invalidate(); };

    get visible() { return this._visible; };
    set visible(value) { this._visible = value; this.invalidate(); };

    constructor() {
        this.navbar = document.querySelector(".navbar");
        this.burger = document.querySelector(".navbar-burger");
        this.menu = document.querySelector(".navbar-menu");
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
