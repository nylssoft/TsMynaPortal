import { Locale } from "./utils/Locale";
import { Theme } from "./utils/Theme";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./utils/Controls";
import { PageType, UserInfoResult } from "./TypeDefinitions";
import { Diary } from "./models/Diary";
import { Contact } from "./models/Contact";
import { Desktop } from "./models/Desktop";
import { Note } from "./models/Note";
import { PasswordItem } from "./models/PasswordItem";
import { DocumentItem } from "./models/DocumentItem";
import { Appointment } from "./models/Appointment";
import { Settings } from "./models/Settings";
import { FetchHelper } from "./utils/FetchHelper";

/**
 * Interface for a page that can be rendered in the application.
 */
export interface Page {

    readonly hideNavBar?: boolean;

    readonly pageType: PageType;

    /**
     * Renders the page asynchronously.
     * 
     * @param parent HTMLElement to which the page will be appended
     * @param pageContext PageContext containing information about the current page and user authentication
     */
    renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void>;
}

/**
 * Context for the current page, containing information about the locale, authentication client, and page type.
 */
export class PageContext {
    // translation
    readonly locale: Locale = new Locale();
    // theme
    readonly theme: Theme = new Theme();
    // authentication
    readonly authenticationClient: AuthenticationClient = new AuthenticationClient();
    // models
    readonly desktop: Desktop = new Desktop();
    readonly contact: Contact = new Contact();
    readonly note: Note = new Note();
    readonly passwordItem: PasswordItem = new PasswordItem();
    readonly diary: Diary = new Diary();
    readonly documentItem: DocumentItem = new DocumentItem();
    readonly appointment: Appointment = new Appointment();
    readonly vote: Appointment = new Appointment();
    readonly settings: Settings = new Settings();
    // flag whether a page with a back button has changed data
    dataChanged: boolean = false;
    // email address for password reset request or registration request
    dataEmail: string = "";
    // markdown page
    markdownPages: string[] = [];
    // current page
    pageType: PageType = "LOGIN_USERNAME_PASSWORD";
    // all page registrations
    private readonly pageRegistrations = new Map<PageType, Page>();
    // auto logout settings
    readonly autoLogoutWarningSeconds: number = 540;
    readonly autoLogoutInactiveSeconds: number = 600;

    /**
     * Registers a page implementation.
     * 
     * @param page page implementation that will be rendered
     */
    registerPage(page: Page): void {
        this.pageRegistrations.set(page.pageType, page);
    }

    /**
     * Renders the current page asynchronously.
     * This method clears the main element and appends the current page's content to it.
     * It also renders the navigation bar if available.
     */
    async renderAsync(): Promise<void> {
        this.updateActivity();
        Controls.showElemById("loading-progress-id", true);
        const page: Page | undefined = this.pageRegistrations.get(this.pageType);
        const navBar: Page | undefined = this.pageRegistrations.get("NAVIGATION_BAR");
        if (page && navBar) {
            const main: HTMLElement = document.getElementById("main-id") as HTMLElement;
            Controls.removeAllChildren(main);
            if (!page.hideNavBar) {
                await navBar.renderAsync(main, this);
            }
            const content: HTMLDivElement = Controls.createDiv(main, "container");
            await page.renderAsync(content, this);
            await this.logoutIfInactiveAsync(content);
            Controls.createDiv(main, "mt-4");
        }
        Controls.showElemById("loading-progress-id", false);
    }

    updateActivity(): void {
        FetchHelper.lastActivityDateTime = Date.now();
    }

    private async logoutIfInactiveAsync(parent: HTMLElement): Promise<void> {
        if (this.authenticationClient.isLoggedIn()) {
            const userInfo: UserInfoResult = await this.authenticationClient.getUserInfoAsync();
            if (userInfo.usePin || !userInfo.useLongLivedToken) {
                const toastContainer: HTMLDivElement = Controls.createDiv(parent, "position-fixed top-0 start-50 translate-middle-x");
                const toast: HTMLDivElement = Controls.createDiv(toastContainer, "toast text-bg-primary", undefined, "toast-logout-id");
                toast.setAttribute("role", "alert");
                toast.setAttribute("data-bs-autohide", "false");
                const toastHeader: HTMLDivElement = Controls.createDiv(toast, "toast-header");
                Controls.createElement(toastHeader, "strong", "me-auto", this.locale.translate("ATTENTION"));
                Controls.createElement(toastHeader, "small", "", "", "toast-logout-timer-id");
                const closeButton: HTMLButtonElement = Controls.createButton(toastHeader, "button", "", "btn-close");
                closeButton.setAttribute("data-bs-dismiss", "toast");
                closeButton.addEventListener("click", () => this.updateActivity());
                Controls.createDiv(toast, "toast-body", this.locale.translate("LOGOUT_IF_NOT_ACTIVE"));
                setInterval(() => this.autoLogoutIfInactive(this), 1000);
            }
        }
    }

    private autoLogoutIfInactive(pageContext: PageContext): void {
        const now: number = Date.now();
        const diff: number = Math.floor((now - FetchHelper.lastActivityDateTime) / 1000);
        if (diff >= pageContext.autoLogoutWarningSeconds) {
            const toast: HTMLDivElement = document.getElementById("toast-logout-id") as HTMLDivElement;
            const bsToast = (window as any).bootstrap?.Toast?.getOrCreateInstance(toast)!;
            if (!bsToast.isShown()) {
                bsToast.show();
            }
            const remain: number = Math.max(0, pageContext.autoLogoutInactiveSeconds - diff);
            const timerElem: HTMLElement = document.getElementById("toast-logout-timer-id") as HTMLElement;
            timerElem.textContent = pageContext.locale.translateWithArgs("SECONDS_LEFT_1", [`${remain}`]);
            if (remain == 0) {
                window.sessionStorage.clear();
                window.location.reload();
            }
        }
    }
}
