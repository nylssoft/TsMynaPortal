import { PageContext } from "./PageContext";
import { AboutPage } from "./pages/AboutPage";
import { AppointmentDetailPage } from "./pages/AppointmentDetailPage";
import { AppointmentVotePage } from "./pages/AppointmentVotePage";
import { ContactDetailPage } from "./pages/ContactDetailPage";
import { DataProtectionPage } from "./pages/DataProtectionPage";
import { DesktopPage } from "./pages/DesktopPage";
import { DiaryDetailPage } from "./pages/DiaryDetailPage";
import { DocumentEditPage } from "./pages/DocumentEditPage";
import { DocumentMovePage } from "./pages/DocumentMovePage";
import { LoginPass2Page } from "./pages/LoginPass2Page";
import { LoginPinPage } from "./pages/LoginPinPage";
import { LoginUsernamePasswordPage } from "./pages/LoginUsernamePasswordPage";
import { NavigationBarPage } from "./pages/NavigationBarPage";
import { NoteDetailPage } from "./pages/NoteDetailPage";
import { PasswordChangePage } from "./pages/PasswordChangePage";
import { PasswordItemDetailPage } from "./pages/PasswordItemDetailPage";
import { RequestResetPasswordPage } from "./pages/RequestResetPasswordPage";
import { PinEditPage } from "./pages/PinEditPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TwoFactorEditPage } from "./pages/TwoFactorEditPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { RequestRegisterPage } from "./pages/RequestRegisterPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ViewMarkdownPage } from "./pages/ViewMarkdownPage";
import { GamesPage } from "./pages/GamesPage";
import { DesktopTabType } from "./TypeDefinitions";

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
        pageContext.registerPage(new DocumentEditPage());
        pageContext.registerPage(new DocumentMovePage());
        pageContext.registerPage(new AppointmentDetailPage());
        pageContext.registerPage(new AppointmentVotePage());
        pageContext.registerPage(new SettingsPage());
        pageContext.registerPage(new PinEditPage());
        pageContext.registerPage(new PasswordChangePage());
        pageContext.registerPage(new TwoFactorEditPage());
        pageContext.registerPage(new RequestResetPasswordPage());
        pageContext.registerPage(new ResetPasswordPage());
        pageContext.registerPage(new RequestRegisterPage());
        pageContext.registerPage(new RegisterPage());
        pageContext.registerPage(new ViewMarkdownPage());
        pageContext.registerPage(new GamesPage());
        await pageContext.locale.setLanguageAsync();
        const params: URLSearchParams = new URLSearchParams(window.location.search);
        if (params.has("vid")) {
            pageContext.vote.vid = params.get("vid");
            pageContext.pageType = "APPOINTMENT_VOTE";
        } else if (params.has("page")) {
            pageContext.pageType = "VIEW_MARKDOWN";
            pageContext.markdownPages = [params.get("page")!];
        } else if (params.has("tab") && pageContext.desktop.isValidTabType(params.get("tab"))) {
            pageContext.desktop.setLastUsedTabType(params.get("tab") as DesktopTabType);
            location.replace(window.location.pathname);
            return;
        } else {
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
        }
        await pageContext.renderAsync();
    }
}