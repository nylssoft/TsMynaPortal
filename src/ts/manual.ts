type ManualLanguage = "en" | "de";

const selector = document.querySelector<HTMLSelectElement>("#manual-language")!;
const control = document.querySelector<HTMLElement>("#manual-language-control")!;
const articles = document.querySelectorAll<HTMLElement>("[data-manual-language]");

function languageFromHash(): ManualLanguage | null {
    const match = /^#(en|de)-/.exec(window.location.hash);
    return match ? match[1] as ManualLanguage : null;
}

function showLanguage(language: ManualLanguage): void {
    articles.forEach(article => {
        article.hidden = article.dataset.manualLanguage !== language;
    });
    selector.value = language;
    document.documentElement.lang = language;
    document.title = language === "de" ? "Portal-Benutzerhandbuch" : "Portal user manual";
}

let savedLanguage: string | null = null;
try {
    savedLanguage = window.localStorage.getItem("locale");
    if (window.localStorage.getItem("theme") === "dark") {
        document.documentElement.dataset.bsTheme = "dark";
    }
} catch (error) {
    console.warn("Unable to read portal display preferences:", error);
}
const preferredLanguage = (savedLanguage || navigator.language).toLowerCase().split("-")[0] === "de" ? "de" : "en";
showLanguage(languageFromHash() || preferredLanguage);
control.hidden = false;

selector.addEventListener("change", () => {
    const language: ManualLanguage = selector.value === "de" ? "de" : "en";
    const hash = window.location.hash;
    showLanguage(language);
    if (/^#(en|de)-/.test(hash)) {
        window.location.hash = hash.replace(/^#(en|de)-/, `#${language}-`);
    }
});
window.addEventListener("hashchange", () => {
    const language = languageFromHash();
    if (language) showLanguage(language);
});
