import { Locale } from "./Locale";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./Controls";

/**
 * Type representing the different pages in the application.
 */
export type PageType = "LOGIN_USERNAME_PASSWORD" | "LOGIN_PIN" | "LOGIN_PASS2" | "ABOUT" | "INBOX" | "ENCRYPTION_KEY";


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
}

/**
 * Context for the current page, containing information about the locale, authentication client, and page type.
 */
export class PageContext {
    private locale: Locale = new Locale();
    private authenticationClient: AuthenticationClient = new AuthenticationClient();
    private pageType: PageType = "LOGIN_USERNAME_PASSWORD";
    private pageRegistrations = new Map<PageType, Page>();
    private navigationPage: Page | null = null;

    /**
     * Registers a page implementation for a specific page type.
     * 
     * @param pageType Type of the page to be rendered
     * @param page page implementation that will be rendered
     */
    public registerPage(pageType: PageType, page: Page): void {
        this.pageRegistrations.set(pageType, page);
    }

    /**
     * Sets the navigation page that will be used for rendering the navigation bar.
     * 
     * @param page Page implementation that will be used for rendering the navigation bar
     */
    public setNavigationPage(page: Page): void {
        this.navigationPage = page;
    }

    /**
     * Renders the current page asynchronously.
     */
    public async renderAsync(): Promise<void> {
        const main: HTMLElement | null = document.getElementById("main-id");
        if (main != null) {
            Controls.removeAllChildren(main);
            if (this.navigationPage != null) {
                await this.navigationPage.renderAsync(main, this);
            }
            const page: Page | undefined = this.pageRegistrations.get(this.pageType);
            if (page) {
                const parent: HTMLDivElement = Controls.createDiv(main, "container py-4 px-3 mx-auto");
                await page.renderAsync(parent, this);
            }
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
}
