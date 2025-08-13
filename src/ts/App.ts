import { PageContext } from "./PageContext";
import { Navigation } from "./Navigation";
import { AboutPage, EncryptionKeyPage, InboxPage, LoginPass2Page, LoginPinPage, LoginUsernamePasswordPage } from "./Pages";

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
        pageContext.registerPage("ABOUT", new AboutPage());
        pageContext.registerPage("INBOX", new InboxPage());
        pageContext.registerPage("LOGIN_USERNAME_PASSWORD", new LoginUsernamePasswordPage());
        pageContext.registerPage("LOGIN_PIN", new LoginPinPage());
        pageContext.registerPage("LOGIN_PASS2", new LoginPass2Page());
        pageContext.registerPage("ENCRYPTION_KEY", new EncryptionKeyPage());
        pageContext.setNavigationPage(new Navigation());
        await pageContext.getLocale().setLanguageAsync();
        await pageContext.getAuthenticationClient().loginWithLongLivedTokenAsync();
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            pageContext.setPageType("INBOX");
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