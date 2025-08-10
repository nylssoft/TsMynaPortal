import { PageContext } from "./PageContext";
import { Controls } from "./Controls";

export class Navigation {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg navbar-dark bg-dark");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        Controls.createElement(container, "a", "navbar-brand", pageContext.getLocale().translate("APP_NAME"));
        const button: HTMLButtonElement = Controls.createElement(container, "button", "navbar-toggler") as HTMLButtonElement;
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#navbarSupportedContent");
        button.setAttribute("aria-controls", "navbarSupportedContent");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Toogle navigation");
        Controls.createSpan(button, "navbar-toggler-icon");        
        const navCollapse: HTMLDivElement = Controls.createDiv(container, "navbar-collapse collapse");
        navCollapse.id = "navbarSupportedContent";
        const ul: HTMLUListElement = Controls.createElement(navCollapse, "ul", "navbar-nav me-auto mb-2 mb-lg-0") as HTMLUListElement;

        if (pageContext.getAuthenticationClient().isLoggedIn()) {

            const inboxLi : HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement; 
            const inboxA: HTMLAnchorElement = Controls.createElement(inboxLi, "a", "nav-link", pageContext.getLocale().translate("INBOX")) as HTMLAnchorElement;
            inboxA.id = "inboxaction-id";
            inboxA.href = "#";
            inboxA.addEventListener("click", async (e: MouseEvent) => this.onClickInboxAsync(e, pageContext));

            const logoutLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
            const logoutA: HTMLAnchorElement = Controls.createElement(logoutLi, "a", "nav-link", pageContext.getLocale().translate("BUTTON_LOGOUT")) as HTMLAnchorElement;
            logoutA.id = "logoutaction-id";
            logoutA.href = "#";
            logoutA.addEventListener("click", async (e: MouseEvent) => this.onClickLogoutAsync(e, pageContext));
        } else {
            const lilogin: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
            const loginA: HTMLAnchorElement = Controls.createElement(lilogin, "a", "nav-link", pageContext.getLocale().translate("BUTTON_LOGIN")) as HTMLAnchorElement;
            loginA.id = "loginaction-id";
            loginA.href = "#";
            loginA.addEventListener("click", async (e: MouseEvent) => this.onClickLoginAsync(e, pageContext));
        }

        const aboutLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
        const aboutA: HTMLAnchorElement = Controls.createElement(aboutLi, "a", "nav-link", pageContext.getLocale().translate("ABOUT")) as HTMLAnchorElement;
        aboutA.href = "#";
        aboutA.id = "aboutaction-id";
        aboutA.addEventListener("click", async (e: MouseEvent) => this.onClickAboutAsync(e, pageContext));

        const language: string = pageContext.getLocale().getLanguage();
        const classLanguage = language === "de" ? "fi-gb" : "fi-de";
        const switchLanguage = language === "de" ? "en" : "de";
        const languageLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
        const languageA: HTMLAnchorElement = Controls.createElement(languageLi, "a", "nav-link", pageContext.getLocale().translate("LANGUAGE")) as HTMLAnchorElement;
        languageA.href = "#";
        languageA.id = "languageaction-id";
        Controls.createSpan(languageA, `mx-2 fi ${classLanguage}`);
        languageA.addEventListener("click", async (e: MouseEvent) => this.onClickLanguageAsync(e, pageContext, switchLanguage));

        let actionId;
        switch (pageContext.getPageType()) {
            case "ABOUT":
                actionId = "aboutaction-id";
                break;
            case "INBOX":
                actionId = "inboxaction-id";
                break;
            default:
                actionId = "loginaction-id";
                break;
        }
        const actionElem: HTMLElement | null =  document.getElementById(actionId);
        if (actionElem) {
            actionElem.classList.add("active");
            actionElem.setAttribute("aria-current", "page");
        }
    }

    private static async onClickLanguageAsync(e: MouseEvent, pageContext: PageContext, languageCode: string): Promise<void> {
        e.preventDefault();
        await pageContext.getLocale().setLanguageAsync(languageCode);
        await pageContext.renderAsync();
    }

    private static async onClickAboutAsync(e: MouseEvent, pageContext: PageContext) {
        e.preventDefault();
        pageContext.setPageType("ABOUT");
        await pageContext.renderAsync();
    }

    private static async onClickLogoutAsync(e: MouseEvent, pageContext: PageContext) {
        e.preventDefault();
        await pageContext.getAuthenticationClient().logoutAsync();
        pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
        await pageContext.renderAsync();
    }

    private static async onClickLoginAsync(e: MouseEvent, pageContext: PageContext) {
        e.preventDefault();
        if (pageContext.getAuthenticationClient().isRequiresPin()) {
            pageContext.setPageType("LOGIN_PIN");
        } else if (pageContext.getAuthenticationClient().isRequiresPass2()) {
            pageContext.setPageType("LOGIN_PASS2");
        } else {
            pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
        }
        await pageContext.renderAsync();
    }

    private static async onClickInboxAsync(e: MouseEvent, pageContext: PageContext) {
        e.preventDefault();
        pageContext.setPageType("INBOX");
        await pageContext.renderAsync();
    }
}