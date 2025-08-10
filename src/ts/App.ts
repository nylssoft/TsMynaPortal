import { Controls } from "./Controls";
import { PageContext } from "./PageContext";
import { Navigation } from "./Navigation";
import { About } from "./About";
import { Inbox } from "./Inbox";
import { LoginUsernamePassword } from "./LoginUsernamePassword";
import { LoginPin } from "./LoginPin";
import { LoginPass2 } from "./LoginPass2";

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
     * Runs the application asynchronously, setting the language and logging in if necessary.
     */
    public async runAsync(): Promise<void> {
        const pageContext: PageContext = new PageContext(this.renderAsync);
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

    private async renderAsync(pageContext: PageContext): Promise<void> {
        const main: HTMLElement = document.getElementById("main-id")!;
        Controls.removeAllChildren(main);
        await Navigation.renderAsync(main, pageContext);
        const parent: HTMLDivElement = Controls.createDiv(main, "container py-4 px-3 mx-auto");
        switch (pageContext.getPageType()) {
            case "ABOUT":
                await About.renderAsync(parent, pageContext);
                break;
            case "INBOX":
                await Inbox.renderAsync(parent, pageContext);
                break;
            case "LOGIN_USERNAME_PASSWORD":
                await LoginUsernamePassword.renderAsync(parent, pageContext);
                break;
            case "LOGIN_PASS2":
                await LoginPass2.renderAsync(parent, pageContext);
                break;
            case "LOGIN_PIN":
                await LoginPin.renderAsync(parent, pageContext);
                break;
        }
    }
}