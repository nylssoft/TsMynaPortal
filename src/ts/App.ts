import { PageContext } from "./PageContext";
import { NavigationBarPage, AboutPage, DataProtectionPage, DesktopPage, LoginPass2Page, LoginPinPage, LoginUsernamePasswordPage, ContactDetailPage, NoteDetailPage, PasswordItemDetailPage } from "./Pages";

/**
 * Main application class that initializes the application, handles authentication, and renders the UI.
 */
export class App {
    private static instance: App;

    private constructor() {
    }

    /**
     * Retrieves the singleton instance of the App class.
     * 
     * @returns the singleton instance of the App class
     */
    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    /**
     * Runs the application asynchronously.
     */
    public async runAsync(): Promise<void> {
        const pageContext: PageContext = new PageContext();
        pageContext.registerPage(new NavigationBarPage());
        pageContext.registerPage(new AboutPage());
        pageContext.registerPage(new DesktopPage());
        pageContext.registerPage(new LoginUsernamePasswordPage());
        pageContext.registerPage(new LoginPinPage());
        pageContext.registerPage(new LoginPass2Page());
        pageContext.registerPage(new DataProtectionPage());
        pageContext.registerPage(new ContactDetailPage());
        pageContext.registerPage(new NoteDetailPage());
        pageContext.registerPage(new PasswordItemDetailPage());
        await pageContext.getLocale().setLanguageAsync();
        await pageContext.getAuthenticationClient().loginWithLongLivedTokenAsync();
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            pageContext.setPageType("DESKTOP");
        } else if (pageContext.getAuthenticationClient().isRequiresPin()) {
            pageContext.setPageType("LOGIN_PIN");
        } else if (pageContext.getAuthenticationClient().isRequiresPass2()) {
            pageContext.setPageType("LOGIN_PASS2");
        } else {
            pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
        }
        await pageContext.renderAsync();
    }
}