import { Locale } from "./utils/Locale";
import { Theme } from "./utils/Theme";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./utils/Controls";
import { ContactResult, DesktopTab, NoteResult, PageType, PasswordItemResult } from "./TypeDefinitions";
import { Diary } from "./models/Diary";

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
    // diary model
    readonly diary: Diary = new Diary();
    // current page
    pageType: PageType = "LOGIN_USERNAME_PASSWORD";
    // page registrations
    private pageRegistrations = new Map<PageType, Page>();

    // --- desktop page

    // welcome message closed
    private welcomeClosed: boolean = false;
    // selected tab in desktop page
    private desktopTab: DesktopTab = "BIRTHDAYS";

    // --- contacts tab in desktop page

    // filter
    private contactsFilter: string = "";
    // selected contact in contact detail page
    private contact: ContactResult | null = null;

    // --- notes tab in desktop page

    // filter
    private noteFilter: string = "";
    // selected note in note detail page
    private note: NoteResult | null = null;

    // --- passwords tab in desktop page

    // filter
    private passwordItemFilter: string = "";
    // selected password item in password detail page
    private passwordItem: PasswordItemResult | null = null;

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
        const loading = document.getElementById("loading-progress-id") as HTMLElement;
        loading.classList.remove("d-none");
        const page: Page | undefined = this.pageRegistrations.get(this.pageType);
        const navBar: Page | undefined = this.pageRegistrations.get("NAVIGATION_BAR");
        if (page && navBar) {
            const main: HTMLElement = document.getElementById("main-id") as HTMLElement;
            Controls.removeAllChildren(main);
            if (!page.hideNavBar) {
                await navBar.renderAsync(main, this);
            }
            const content: HTMLDivElement = Controls.createDiv(main, "container py-4 px-3 mx-auto");
            await page.renderAsync(content, this);
        }
        loading.classList.add("d-none");
    }

    public getDesktopTab(): DesktopTab {
        return this.desktopTab;
    }

    public setDesktopTab(desktopTab: DesktopTab) {
        this.desktopTab = desktopTab;
    }

    public isWelcomeClosed(): boolean {
        return this.welcomeClosed;
    }

    public setWelcomeClosed(closed: boolean) {
        this.welcomeClosed = closed;
    }

    /**
     * Retrieves the currently set contact.
     * If no contact is set, it returns null.
     * 
     * @returns the currently set contact or null if no contact is set
     */
    public getContact(): ContactResult | null {
        return this.contact;
    }

    /**
     * Sets the contact to be used in the application.
     * If the contact is null, it clears the current contact.
     * 
     * @param contact the contact to be set, or null to clear the current contact
     */
    public setContact(contact: ContactResult | null) {
        this.contact = contact;
    }

    public getContactsFilter(): string {
        return this.contactsFilter;
    }

    public setContactsFilter(filter: string) {
        this.contactsFilter = filter;
    }

    /**
     * Retrieves the currently set note.
     * If no note is set, it returns null.
     * 
     * @returns the currently set note or null if no note is set
     */
    public getNote(): NoteResult | null {
        return this.note;
    }

    /**
     * Sets the note to be used in the application.
     * If the note is null, it clears the current note.
     * 
     * @param note the note to be set, or null to clear the current note
     */
    public setNote(note: NoteResult | null) {
        this.note = note;
    }

    public getNoteFilter(): string {
        return this.noteFilter;
    }

    public setNoteFilter(filter: string) {
        this.noteFilter = filter;
    }

    public getPasswordItem(): PasswordItemResult | null {
        return this.passwordItem;
    }

    public setPasswordItem(item: PasswordItemResult | null) {
        this.passwordItem = item;
    }

    public getPasswordItemFilter(): string {
        return this.passwordItemFilter;
    }

    public setPasswordItemFilter(filter: string) {
        this.passwordItemFilter = filter;
    }
}
