import { Locale } from "./utils/Locale";
import { Theme } from "./utils/Theme";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./utils/Controls";
import { PageType } from "./TypeDefinitions";
import { Diary } from "./models/Diary";
import { Contact } from "./models/Contact";
import { Desktop } from "./models/Desktop";
import { Note } from "./models/Note";
import { PasswordItem } from "./models/PasswordItem";
import { DocumentItem } from "./models/DocumentItem";
import { Appointment } from "./models/Appointment";
import { Settings } from "./models/Settings";

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
            Controls.createDiv(main, "mt-4");
        }
        Controls.showElemById("loading-progress-id", false);
    }
}
