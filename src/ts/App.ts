import { PageContext } from "./PageContext";
import { AboutPage } from "./pages/AboutPage";
import { ContactDetailPage } from "./pages/ContactDetailPage";
import { DataProtectionPage } from "./pages/DataProtectionPage";
import { DesktopPage } from "./pages/DesktopPage";
import { DiaryDetailPage } from "./pages/DiaryDetailPage";
import { LoginPass2Page } from "./pages/LoginPass2Page";
import { LoginPinPage } from "./pages/LoginPinPage";
import { LoginUsernamePasswordPage } from "./pages/LoginUsernamePasswordPage";
import { NavigationBarPage } from "./pages/NavigationBarPage";
import { NoteDetailPage } from "./pages/NoteDetailPage";
import { PasswordItemDetailPage } from "./pages/PasswordItemDetailPage";

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
    static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    /**
     * Runs the application asynchronously.
     */
    async runAsync(): Promise<void> {
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
        pageContext.registerPage(new DiaryDetailPage());
        await pageContext.locale.setLanguageAsync();
        await pageContext.authenticationClient.loginWithLongLivedTokenAsync();
        if (pageContext.authenticationClient.isLoggedIn()) {
            pageContext.pageType = "DESKTOP";
        } else if (pageContext.authenticationClient.isRequiresPin()) {
            pageContext.pageType = "LOGIN_PIN";
        } else if (pageContext.authenticationClient.isRequiresPass2()) {
            pageContext.pageType = "LOGIN_PASS2";
        } else {
            pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
        }
        await pageContext.renderAsync();
    }
}