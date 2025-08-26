import { ClickAction } from "../actions/ClickAction";
import { LogoutAction } from "../actions/LogoutAction";
import { ShowAboutPageAction } from "../actions/ShowAboutPageAction";
import { ShowDataProtectionPageAction } from "../actions/ShowDataProtectionPageAction";
import { ShowDesktopPageAction } from "../actions/ShowDesktopPageAction";
import { ShowLoginPageAction } from "../actions/ShowLoginPageAction";
import { ToggleLanguageAction } from "../actions/ToggleLanguageAction";
import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";

/**
 * Page implementation for the navigation bar.
 * It renders links to different pages such as Desktop, Data Protection, About, and Login.
 * It also includes a language toggle and a logout option if the user is logged in.
 * The navigation bar is responsive and collapses on smaller screens.
 */
export class NavigationBarPage implements Page {

    pageType: PageType = "NAVIGATION_BAR";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const ul: HTMLUListElement = this.createNavBar(parent, pageContext, "APP_NAME");
        if (pageContext.authenticationClient.isLoggedIn()) {
            this.createNavItem(ul, pageContext, "DESKTOP", new ShowDesktopPageAction());
            this.createNavItem(ul, pageContext, "DATA_PROTECTION", new ShowDataProtectionPageAction());
        } else {
            this.createNavItem(ul, pageContext, "BUTTON_LOGIN", new ShowLoginPageAction());
        }
        this.createNavItem(ul, pageContext, "ABOUT", new ShowAboutPageAction());
        const aToogleLanguage: HTMLAnchorElement = this.createNavItem(ul, pageContext, "LANGUAGE", new ToggleLanguageAction());
        Controls.createSpan(aToogleLanguage, `mx-2 fi ${pageContext.locale.getLanguage() == "de" ? "fi-gb" : "fi-de"}`);
        if (pageContext.authenticationClient.isLoggedIn()) {
            this.createNavItem(ul, pageContext, "BUTTON_LOGOUT", new LogoutAction());
        }
    }

    private createNavBar(parent: HTMLElement, pageContext: PageContext, label: string): HTMLUListElement {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        const aBrand: HTMLAnchorElement = Controls.createElement(container, "a", "navbar-brand", pageContext.locale.translate(label)) as HTMLAnchorElement;
        aBrand.setAttribute("role", "button");
        aBrand.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.theme.toggle();
            await pageContext.renderAsync();
        });
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
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "nav-link", pageContext.locale.translate(label)) as HTMLAnchorElement;
        a.href = "#";
        a.addEventListener("click", async (e: MouseEvent) => action.runAsync(e, pageContext));
        if (action.isActive(pageContext)) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
        return a;
    }
}
