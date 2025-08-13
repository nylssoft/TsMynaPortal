import { PageContext, Page } from "./PageContext";
import { Controls } from "./Controls";
import { ClickAction, LogoutAction, ShowAboutPageAction, ShowDataProtectionPageAction, ShowInboxPageAction, ShowLoginPageAction, ToggleLanguageAction } from "./Actions";

/**
 * Renders the navigation bar with links to different pages.
 */
export class Navigation implements Page{
 
    /**
     * Renders the navigation bar.
     * 
     * @param parent HTMLElement to which the navigation bar will be appended
     * @param pageContext page context containing information about the current page and user authentication
     */
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const ul: HTMLUListElement = this.createNavBar(parent, pageContext, "APP_NAME");
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            this.createNavItem(ul, pageContext, "INBOX",  new ShowInboxPageAction());
            this.createNavItem(ul, pageContext, "ENCRYPTION_KEY", new ShowDataProtectionPageAction());
        } else {
            this.createNavItem(ul, pageContext, "BUTTON_LOGIN", new ShowLoginPageAction());
        }
        this.createNavItem(ul, pageContext, "ABOUT", new ShowAboutPageAction());
        const aToogleLanguage: HTMLAnchorElement = this.createNavItem(ul, pageContext, "LANGUAGE", new ToggleLanguageAction());
        Controls.createSpan(aToogleLanguage, `mx-2 fi ${pageContext.getLocale().getLanguage() == "de" ? "fi-gb" : "fi-de"}`);
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            this.createNavItem(ul, pageContext, "BUTTON_LOGOUT", new LogoutAction());
        }        
    }

    private createNavBar(parent: HTMLElement, pageContext: PageContext, label: string): HTMLUListElement {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg navbar-dark bg-dark");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        Controls.createElement(container, "a", "navbar-brand", pageContext.getLocale().translate(label));
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
        return Controls.createElement(navCollapse, "ul", "navbar-nav me-auto mb-2 mb-lg-0") as HTMLUListElement;
    }

    private createNavItem(parent: HTMLElement, pageContext: PageContext, label: string, action: ClickAction): HTMLAnchorElement {
        const li: HTMLLIElement = Controls.createElement(parent, "li", "nav-item") as HTMLLIElement;
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "nav-link", pageContext.getLocale().translate(label)) as HTMLAnchorElement;
        a.href = "#";
        a.addEventListener("click", async (e: MouseEvent) => action.runAsync(e, pageContext));
        if (action.isActive(pageContext)) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
        return a;
    }
}