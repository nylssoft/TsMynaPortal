import { ClickAction } from "../actions/ClickAction";
import { ShowAboutPageAction } from "../actions/ShowAboutPageAction";
import { ShowDataProtectionPageAction } from "../actions/ShowDataProtectionPageAction";
import { ShowDesktopPageAction } from "../actions/ShowDesktopPageAction";
import { ShowLoginPageAction } from "../actions/ShowLoginPageAction";
import { ToggleLanguageAction } from "../actions/ToggleLanguageAction";
import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { ShowVotePageAction } from "../actions/ShowVotePageAction";
import { ShowSettingsPageAction } from "../actions/ShowSettingsPageAction";
import { ShowRegisterPageAction } from "../actions/ShowRegisterPageAction";

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
        if (pageContext.vote.vid != null) {
            this.createNavItem(ul, pageContext, "HEADER_APPOINTMENTS", new ShowVotePageAction());
        } else {
            if (pageContext.authenticationClient.isLoggedIn()) {
                this.createNavItem(ul, pageContext, "DESKTOP", new ShowDesktopPageAction());
                this.createNavItem(ul, pageContext, "DATA_PROTECTION", new ShowDataProtectionPageAction());
            } else {
                this.createNavItem(ul, pageContext, "BUTTON_LOGIN", new ShowLoginPageAction());
                this.createNavItem(ul, pageContext, "HEADER_REGISTER", new ShowRegisterPageAction());
            }
        }
        this.createGamesDropdown(ul, pageContext);
        this.createNavItem(ul, pageContext, "SETTINGS", new ShowSettingsPageAction());
        this.createNavItem(ul, pageContext, "ABOUT", new ShowAboutPageAction());
    }

    private createNavBar(parent: HTMLElement, pageContext: PageContext, label: string): HTMLUListElement {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        const aBrand: HTMLAnchorElement = Controls.createElement(container, "a", "navbar-brand", pageContext.locale.translate(label)) as HTMLAnchorElement;
        aBrand.setAttribute("role", "button");
        aBrand.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            if (pageContext.vote.vid != null) {
                await new ShowVotePageAction().runAsync(e, pageContext);
            } else if (pageContext.authenticationClient.isLoggedIn()) {
                await new ShowDesktopPageAction().runAsync(e, pageContext);
            } else {
                await new ShowLoginPageAction().runAsync(e, pageContext);
            }
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
        a.setAttribute("role", "button");
        // a.href = "";
        a.addEventListener("click", async (e: MouseEvent) => action.runAsync(e, pageContext));
        if (action.isActive(pageContext)) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
        return a;
    }

    private createGamesDropdown(parent: HTMLElement, pageContext: PageContext): HTMLLIElement {
        const li: HTMLLIElement = Controls.createElement(parent, "li", "nav-item dropdown") as HTMLLIElement;
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "nav-link dropdown-toggle", pageContext.locale.translate("GAMES")) as HTMLAnchorElement;
        a.setAttribute("role", "button");
        a.setAttribute("data-bs-toggle", "dropdown");
        a.setAttribute("aria-expanded", "false");
        a.href = "#";
        const ul: HTMLUListElement = Controls.createElement(li, "ul", "dropdown-menu") as HTMLUListElement;
        const baseurl: string = window.location.hostname == "localhost" ? "https://www.stockfleth.eu" : "";
        this.createExternalUrl(ul, pageContext, "ARKANOID", `${baseurl}/arkanoid?nomenu=true`);
        this.createExternalUrl(ul, pageContext, "BACKGAMMON", `${baseurl}/backgammon?nomenu=true`);
        this.createExternalUrl(ul, pageContext, "CHESS", `${baseurl}/chess?nomenu=true`);
        this.createExternalUrl(ul, pageContext, "SKAT", `${baseurl}/skat?nomenu=true`);
        this.createExternalUrl(ul, pageContext, "TETRIS_ARCADE", `${baseurl}/webpack/tstetris`);
        this.createExternalUrl(ul, pageContext, "TETRIS", `${baseurl}/tetris?nomenu=true`);
        return li;
    }

    private createExternalUrl(parent: HTMLElement, pageContext: PageContext, label: string, url: string): HTMLLIElement {
        const li: HTMLLIElement = Controls.createElement(parent, "li") as HTMLLIElement;
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "dropdown-item", pageContext.locale.translate(label)) as HTMLAnchorElement;
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        return li;
    }
}
