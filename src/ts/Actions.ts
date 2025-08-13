import { PageContext, PageType } from "./PageContext";

/**
 * Interface for actions that can be triggered by clicking on navigation items.
 */
export interface ClickAction {

    /**
     * Executes the action when the navigation item is clicked.
     * 
     * @param e MouseEvent triggered by the click
     * @param pageContext PageContext containing information about the current page and user authentication
     */
    runAsync(e:MouseEvent, pageContext: PageContext): Promise<void>;

    /**
     * Returns whether the action is active on the current page.
     * 
     * @param pageContext PageContext containing information about the current page and user authentication
     * @return boolean indicating whether the action is active on the current page
     */
    isActive(pageContext: PageContext): boolean;
}

/**
 * Abstract class for actions that switch the current page.
 */
export abstract class SwitchPageClickAction implements ClickAction {

    protected switchPage: PageType;

    constructor(switchPage: PageType) {
        this.switchPage = switchPage;
    }

    /**
     * Executes the action when the navigation item is clicked and performs any necessary setup before switching pages.
     * 
     * @param e MouseEvent triggered by the click
     * @param pageContext PageContext containing information about the current page and user authentication
     */
    protected async beforeRunAsync(e:MouseEvent, pageContext: PageContext): Promise<void> {
    }

    public async runAsync(e:MouseEvent, pageContext: PageContext): Promise<void> {
        this.beforeRunAsync(e, pageContext);
        e.preventDefault();
        pageContext.setPageType(this.switchPage);
        await pageContext.renderAsync();
    }    

    public isActive(pageContext: PageContext): boolean {
        return this.switchPage === pageContext.getPageType();
    }
}

/**
 * Action to show the data protection page.
 */
export class ShowDataProtectionPageAction extends SwitchPageClickAction {

    constructor() {
        super("ENCRYPTION_KEY");
    }
}

/**
 * Action to show the about page.
 */
export class ShowAboutPageAction extends SwitchPageClickAction {

    constructor() {
        super("ABOUT");
    }
}

/**
 * Action to show the inbox page.
 */
export class ShowInboxPageAction extends SwitchPageClickAction {

    constructor() {
        super("INBOX");
    }
}

/**
 * Action to log out the user.
 */
export class LogoutAction extends SwitchPageClickAction {

    constructor() {
        super("LOGIN_USERNAME_PASSWORD");
    }

    override async beforeRunAsync(e:MouseEvent, pageContext: PageContext): Promise<void> {
        await pageContext.getAuthenticationClient().logoutAsync();
    }

    override isActive(pageContext: PageContext): boolean {
        return false;
    }
}

/**
 * Action to show the login page.
 */
export class ShowLoginPageAction extends SwitchPageClickAction {

    constructor() {
        super("LOGIN_USERNAME_PASSWORD");
    }

    public async beforeRunAsync(e:MouseEvent, pageContext: PageContext): Promise<void> {
        if (pageContext.getAuthenticationClient().isRequiresPin()) {
            this.switchPage = "LOGIN_PIN";
        } else if (pageContext.getAuthenticationClient().isRequiresPass2()) {
            this.switchPage = "LOGIN_PASS2";
        }
    }

    public isActive(pageContext: PageContext): boolean {
        return this.switchPage === pageContext.getPageType() || pageContext.getPageType() === "LOGIN_PIN" || pageContext.getPageType() === "LOGIN_PASS2";
    }
}

/**
 * Action to toggle the language between German and English.
 */
export class ToggleLanguageAction implements ClickAction {

    public async runAsync(e:MouseEvent, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const switchLanguage = pageContext.getLocale().getLanguage() === "de" ? "en" : "de";
        await pageContext.getLocale().setLanguageAsync(switchLanguage);
        await pageContext.renderAsync();
    }

    public isActive(pageContext: PageContext): boolean {
        return false;        
    }
}
