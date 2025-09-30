import { ClickAction } from "../actions/ClickAction";
import { ShowAboutPageAction } from "../actions/ShowAboutPageAction";
import { ShowDataProtectionPageAction } from "../actions/ShowDataProtectionPageAction";
import { ShowDesktopPageAction } from "../actions/ShowDesktopPageAction";
import { ShowLoginPageAction } from "../actions/ShowLoginPageAction";
import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { ShowVotePageAction } from "../actions/ShowVotePageAction";
import { ShowSettingsPageAction } from "../actions/ShowSettingsPageAction";
import { ShowRegisterPageAction } from "../actions/ShowRegisterPageAction";
import { LogoutAction } from "../actions/LogoutAction";
import { ShowAGamesPageAction } from "../actions/ShowGamesPage";

/**
 * Page implementation for the navigation bar.
 * It renders links to different pages such as Desktop, Data Protection, About, and Login.
 * It also includes a language toggle and a logout option if the user is logged in.
 * The navigation bar is responsive and collapses on smaller screens.
 */
export class NavigationBarPage implements Page {

    pageType: PageType = "NAVIGATION_BAR";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        let user: UserInfoResult | null = null;
        if (pageContext.authenticationClient.isLoggedIn()) {
            user = await pageContext.authenticationClient.getUserInfoAsync()!;
        }
        const ul: HTMLUListElement = this.createNavBar(parent, pageContext, user);
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
        this.createNavItem(ul, pageContext, "GAMES", new ShowAGamesPageAction());
        this.createNavItem(ul, pageContext, "SETTINGS", new ShowSettingsPageAction());
        this.createNavItem(ul, pageContext, "ABOUT", new ShowAboutPageAction());
        if (pageContext.authenticationClient.isLoggedIn() || pageContext.authenticationClient.isRequiresPin() || pageContext.authenticationClient.isRequiresPass2()) {
            const logoutAction: LogoutAction = new LogoutAction();
            const li: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
            const a: HTMLAnchorElement = Controls.createElement(li, "a", "nav-link d-inline-block bg-primary text-light rounded p-2 ms-lg-2 mt-2 mt-lg-0", pageContext.locale.translate("BUTTON_LOGOUT")) as HTMLAnchorElement;
            a.style.width = "auto";
            a.setAttribute("role", "button");
            a.setAttribute("data-bs-target", "#confirmationdialog-id_logout");
            a.setAttribute("data-bs-toggle", "modal");
            // render logout confirmation dialog
            Controls.createConfirmationDialog(
                parent,
                pageContext.locale.translate("BUTTON_LOGOUT"),
                pageContext.locale.translate("INFO_REALLY_LOGOUT"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"), "_logout");
            document.getElementById("confirmationyesbutton-id_logout")!.addEventListener("click", async (e: MouseEvent) => logoutAction.runAsync(e, pageContext));
        }
    }

    private createNavBar(parent: HTMLElement, pageContext: PageContext, user: UserInfoResult | null): HTMLUListElement {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        let aBrand: HTMLAnchorElement
        if (user == null) {
            aBrand = Controls.createElement(container, "a", "navbar-brand", pageContext.locale.translate("APP_NAME")) as HTMLAnchorElement;
        }
        else {
            aBrand = Controls.createElement(container, "a", "navbar-brand", user.name) as HTMLAnchorElement;
            if (user.photo != null) {
                const img: HTMLImageElement = Controls.createElement(aBrand, "img", "img-thumbnail ms-1") as HTMLImageElement;
                img.width = 32;
                img.height = 32;
                img.src = user.photo;
                img.alt = user.name;
            }
        }
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
        a.addEventListener("click", async (e: MouseEvent) => action.runAsync(e, pageContext));
        if (action.isActive(pageContext)) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
        return a;
    }

    private createGamesLink(parent: HTMLElement, pageContext: PageContext, label: string, url: string): HTMLLIElement {
        const li: HTMLLIElement = Controls.createElement(parent, "li") as HTMLLIElement;
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "dropdown-item", pageContext.locale.translate(label)) as HTMLAnchorElement;
        a.href = url;
        return li;
    }
}
