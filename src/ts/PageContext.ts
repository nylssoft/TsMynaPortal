import { Locale } from "./Locale";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./Controls";
import { ContactResult, NoteResult, PasswordItemResult } from "./TypeDefinitions";

/**
 * Type representing the different pages in the application.
 */
export type PageType = "LOGIN_USERNAME_PASSWORD" | "LOGIN_PIN" | "LOGIN_PASS2" | "ABOUT" | "DESKTOP"
    | "DATA_PROTECTION" | "NAVIGATION_BAR" | "CONTACT_DETAIL" | "NOTE_DETAIL" | "PASSWORD_ITEM_DETAIL";


/**
 * Interface for a page that can be rendered in the application.
 */
export interface Page {
    /**
     * Renders the page asynchronously.
     * 
     * @param parent HTMLElement to which the page will be appended
     * @param pageContext PageContext containing information about the current page and user authentication
     */
    renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void>;

    /**
     * Retrieves the page type of the current page.
     * 
     * @returns PageType representing the type of the current page
     */
    getPageType(): PageType;
}

/**
 * Context for the current page, containing information about the locale, authentication client, and page type.
 */
export class PageContext {
    private locale: Locale = new Locale();
    private authenticationClient: AuthenticationClient = new AuthenticationClient();
    private contact: ContactResult | null = null;
    private note: NoteResult | null = null;
    private passwordItem: PasswordItemResult | null = null;
    private welcomeClosed: boolean = false;
    private contactsFilter: string = "";
    private noteFilter: string = "";
    private passwordItemFilter: string = "";
    private pageType: PageType = "LOGIN_USERNAME_PASSWORD";
    private pageRegistrations = new Map<PageType, Page>();

    /**
     * Registers a page implementation.
     * 
     * @param page page implementation that will be rendered
     */
    public registerPage(page: Page): void {
        this.pageRegistrations.set(page.getPageType(), page);
    }

    /**
     * Renders the current page asynchronously.
     * This method clears the main element and appends the current page's content to it.
     * It also renders the navigation bar if available.
     */
    public async renderAsync(): Promise<void> {
        const main: HTMLElement | null = document.getElementById("main-id");
        if (main != null) {
            Controls.removeAllChildren(main);
            this.pageRegistrations.get("NAVIGATION_BAR")?.renderAsync(main, this);
            const content: HTMLDivElement = Controls.createDiv(main, "container py-4 px-3 mx-auto");
            await this.pageRegistrations.get(this.pageType)?.renderAsync(content, this);
        }
    }

    /**
     * Retrieves the locale object containing translations and language settings.
     * 
     * @returns locale object containing translations and language settings
     */
    public getLocale(): Locale {
        return this.locale;
    }

    /**
     * Retrieves the authentication client used for user authentication.
     * 
     * @returns authentication client used for user authentication
     */
    public getAuthenticationClient(): AuthenticationClient {
        return this.authenticationClient;
    }

    /**
     * Retrieves the current page type.
     * 
     * @returns current page type
     */
    public getPageType(): PageType {
        return this.pageType;
    }

    /**
     * Sets the current page type.
     * 
     * @param pageType current page type to be set
     */
    public setPageType(pageType: PageType) {
        this.pageType = pageType;
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

    public getPasswordItem(): PasswordItemResult | null {
        return this.passwordItem;
    }

    public setPasswordItem(item: PasswordItemResult | null) {
        this.passwordItem = item;
    }

    public isWelcomeClosed() : boolean {
        return this.welcomeClosed;
    }

    public setWelcomeClosed(closed: boolean) {
        this.welcomeClosed = closed;
    }

    public getContactsFilter(): string {
        return this.contactsFilter;
    }

    public setContactsFilter(filter: string) {
        this.contactsFilter = filter;
    }

    public getNoteFilter(): string {
        return this.noteFilter;
    }

    public setNoteFilter(filter: string) {
        this.noteFilter = filter;
    }

    public getPasswordItemFilter(): string {
        return this.passwordItemFilter;
    }

    public setPasswordItemFilter(filter: string) {
        this.passwordItemFilter = filter;
    }
}
