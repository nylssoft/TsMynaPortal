import { getContentLanguage, getPortalLanguage } from "./utils/LanguagePreference";

type ManualLanguage = "en" | "de";

const articles = document.querySelectorAll<HTMLElement>("[data-manual-language]");

function languageFromHash(): ManualLanguage | null {
    const match = /^#(en|de)-/.exec(window.location.hash);
    return match ? match[1] as ManualLanguage : null;
}

function showLanguage(language: ManualLanguage): void {
    articles.forEach(article => {
        article.hidden = article.dataset.manualLanguage !== language;
    });
    document.documentElement.lang = language;
    document.title = language === "de" ? "Portal-Benutzerhandbuch" : "Portal user manual";
}

function selectLanguage(language: ManualLanguage): void {
    const hash = window.location.hash;
    showLanguage(language);
    if (languageFromHash() && languageFromHash() !== language) {
        window.location.hash = hash.replace(/^#(en|de)-/, `#${language}-`);
    }
}

try {
    selectLanguage(getContentLanguage(getPortalLanguage()));
    if (window.localStorage.getItem("theme") === "dark") {
        document.documentElement.dataset.bsTheme = "dark";
    }
} catch (error) {
    console.warn("Unable to read portal display preferences:", error);
    selectLanguage(getContentLanguage(window.navigator.language.split("-")[0]));
}
window.addEventListener("hashchange", () => {
    const language = languageFromHash();
    if (language) showLanguage(language);
});
window.addEventListener("storage", event => {
    if (event.key === "locale" || event.key === null) {
        selectLanguage(getContentLanguage(event.newValue || window.navigator.language.split("-")[0]));
    }
    if (event.key === "theme" || event.key === null) {
        document.documentElement.dataset.bsTheme = event.newValue && event.newValue !== "light" ? "dark" : "light";
    }
});
