export function getPortalLanguage(): string {
    return window.localStorage.getItem("locale") || window.navigator.language.split("-")[0];
}

export function getContentLanguage(language: string): "de" | "en" {
    return language === "de" ? "de" : "en";
}
