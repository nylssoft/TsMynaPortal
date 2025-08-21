export class Theme {

    private theme: string;

    constructor() {
        this.theme = window.localStorage.getItem("theme") || "light";
        this.set(this.theme);
    }

    public set(theme: string) {
        this.theme = theme == "light" ? theme : "dark";
        window.localStorage.setItem("theme", this.theme);
        document.documentElement.setAttribute("data-bs-theme", this.theme);
    }

    public toggle() {
        this.set(this.theme == "light" ? "dark" : "light");
    }
}