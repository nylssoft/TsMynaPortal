export class Theme {

    private theme: string;

    constructor() {
        this.theme = window.localStorage.getItem("theme") || "light";
        this.set(this.theme);
    }

    set(theme: string) {
        this.theme = theme == "light" ? theme : "dark";
        window.localStorage.setItem("theme", this.theme);
        document.documentElement.setAttribute("data-bs-theme", this.theme);
    }

    toggle() {
        this.set(this.theme == "light" ? "dark" : "light");
    }

    isLight(): boolean {
        return this.theme == "light";
    }
}