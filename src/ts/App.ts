import { Locale } from "./Locale";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./Controls";
import { UserInfoResult } from "./TypeDefinitions";

/**
 * Main application class that initializes the application, handles authentication, and renders the UI.
 */
export class App {
    private static instance: App;

    private locale: Locale = new Locale();

    private authenticationClient: AuthenticationClient = new AuthenticationClient();

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
        await this.locale.setLanguageAsync();
        await this.authenticationClient.loginWithLongLivedTokenAsync();
        await this.renderPageAsync();
    }

    private async renderPageAsync(): Promise<void> {
        const content: HTMLElement = document.getElementById("main-id")!;
        Controls.removeAllChildren(content);
        await this.renderNavigationAsync(content);
        const parent: HTMLDivElement = Controls.createDiv(content, "container py-4 px-3 mx-auto");
        if (!this.authenticationClient.isLoggedIn()) {
            if (this.authenticationClient.isRequiresPass2()) {
                await this.renderLoginWithPass2Async(parent);
            } else if (this.authenticationClient.isRequiresPin()) {
                await this.renderLoginWithPinAsync(parent);
            } else {
                await this.renderLoginWithUsernameAndPasswordAsync(parent);
            }
        } else {
            await this.renderInboxAsync(parent);
        }
    }

    private async renderNavigationAsync(parent: HTMLElement): Promise<void> {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg navbar-dark bg-dark");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        Controls.createElement(container, "a", "navbar-brand", this.locale.translate("APP_NAME"));
        const button: HTMLButtonElement = Controls.createElement(container, "button", "navbar-toggler") as HTMLButtonElement;
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#navbarSupportedContent");
        button.setAttribute("aria-controls", "navbarSupportedContent");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Toogle navigation");
        Controls.createSpan(button, "navbar-toggler-icon");        
        const navCollapse: HTMLDivElement = Controls.createDiv(container, "navbar-collapse collapse");
        navCollapse.id = "navbarSupportedContent";
        const ul: HTMLUListElement = Controls.createElement(navCollapse, "ul", "navbar-nav me-auto mb-2 mb-lg-0") as HTMLUListElement;

        if (this.authenticationClient.isLoggedIn()) {

            const inboxLi : HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement; 
            const inboxA: HTMLAnchorElement = Controls.createElement(inboxLi, "a", "nav-link active", this.locale.translate("INBOX")) as HTMLAnchorElement;
            inboxA.setAttribute("aria-current", "page");
            inboxA.href = "#";
            inboxA.addEventListener("click", async (e: MouseEvent) => this.onClickAsync(e));

            const logoutLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
            const logoutA: HTMLAnchorElement = Controls.createElement(logoutLi, "a", "nav-link", this.locale.translate("BUTTON_LOGOUT")) as HTMLAnchorElement;
            logoutA.href = "#";
            logoutA.addEventListener("click", async (e: MouseEvent) => this.onClickLogoutAsync(e));
        } else {
            const lilogin: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
            const loginA: HTMLAnchorElement = Controls.createElement(lilogin, "a", "nav-link active", this.locale.translate("BUTTON_LOGIN")) as HTMLAnchorElement;
            loginA.setAttribute("aria-current", "page");
            loginA.href = "#";
            loginA.addEventListener("click", async (e: MouseEvent) => this.onClickAsync(e));
        }

        const aboutLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
        const aboutA: HTMLAnchorElement = Controls.createElement(aboutLi, "a", "nav-link", this.locale.translate("ABOUT")) as HTMLAnchorElement;
        aboutA.addEventListener("click", async (e: MouseEvent) => this.renderAboutAsync());

        const language: string = this.locale.getLanguage();
        const classLanguage = language === "de" ? "fi-gb" : "fi-de";
        const switchLanguage = language === "de" ? "en" : "de";
        const languageLi: HTMLLIElement = Controls.createElement(ul, "li", "nav-item") as HTMLLIElement;
        const languageA: HTMLAnchorElement = Controls.createElement(languageLi, "a", "nav-link", this.locale.translate("LANGUAGE")) as HTMLAnchorElement;
        Controls.createSpan(languageA, `mx-2 fi ${classLanguage}`);
        languageA.addEventListener("click", async (e: MouseEvent) => this.onLanguageChangeAsync(e, switchLanguage));
    }

    private async renderLoginWithUsernameAndPasswordAsync(parent: HTMLElement): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent);

        const divUsername: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", this.locale.translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        inputUsername.setAttribute("aria-describedby", "usernamehelp-id");
        const usernameHelpDiv: HTMLDivElement = Controls.createDiv(divUsername, "form-text", this.locale.translate("INFO_ENTER_USERNAME"));
        usernameHelpDiv.id = "usernamehelp-id";

        const divPassword: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", this.locale.translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        inputPassword.setAttribute("aria-describedby", "passwordhelp-id");
        const passwordHelpDiv: HTMLDivElement = Controls.createDiv(divPassword, "form-text", this.locale.translate("INFO_ENTER_PASSWORD"));
        passwordHelpDiv.id = "passwordhelp-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_CONTINUE"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithUsernameAndPasswordAsync(e, inputUsername, inputPassword, alertDiv));
    }

    private async renderLoginWithPass2Async(parent: HTMLElement): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent);

        const divPass2: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPass2, "pass2-id", "form-label", this.locale.translate("LABEL_SEC_KEY"));
        const inputPass2: HTMLInputElement = Controls.createInput(divPass2, "text", "pass2-id", "form-control");
        inputPass2.setAttribute("aria-describedby", "pass2help-id");
        const pass2HelpDiv: HTMLDivElement = Controls.createDiv(divPass2, "form-text", this.locale.translate("INFO_ENTER_SEC_KEY"));
        pass2HelpDiv.id = "pass2help-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) =>  this.onClickLoginWithPass2Async(e, inputPass2, alertDiv));
    }

    private async renderLoginWithPinAsync(parent: HTMLElement): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent);

        const divPin: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", this.locale.translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        inputPin.setAttribute("aria-describedby", "pinhelp-id");
        const pinHelpDiv: HTMLDivElement = Controls.createDiv(divPin, "form-text", this.locale.translate("INFO_ENTER_PIN"));
        pinHelpDiv.id = "pinhelp-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_CONTINUE"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPinAsync(e, inputPin, alertDiv));
    }

    private async renderInboxAsync(parent: HTMLElement): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("INBOX"));
        const welcomeMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        const userInfo: UserInfoResult = await this.authenticationClient.getUserInfoAsync();
        welcomeMessage.textContent = this.locale.translateWithArgs("MESSAGE_WELCOME_1", [userInfo.name]);
    }

    private async renderAboutAsync(): Promise<void> {
        const content: HTMLElement = document.getElementById("main-id")!;
        Controls.removeAllChildren(content);
        await this.renderNavigationAsync(content);
        const parent: HTMLDivElement = Controls.createDiv(content, "container py-4 px-3 mx-auto");
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("ABOUT"));
        const aboutMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        aboutMessage.textContent = this.locale.translate("TEXT_COPYRIGHT_YEAR");
    }

    private async onLanguageChangeAsync(e: MouseEvent, languageCode: string): Promise<void> {
        e.preventDefault();
        await this.locale.setLanguageAsync(languageCode);
        await this.renderPageAsync();
    }

    private async onClickAsync(e: MouseEvent) {
        e.preventDefault();
        await this.renderPageAsync();
    }

    private async onClickLogoutAsync(e: MouseEvent) {
        e.preventDefault();
        await this.authenticationClient.logoutAsync();
        await this.renderPageAsync();
    }

    private async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            await this.authenticationClient.loginAsync(inputUsername.value, inputPassword.value, this.locale.getLanguage());
            await this.renderPageAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, this.locale.translateError(error));
        }
    }

    private async onClickLoginWithPinAsync(e: MouseEvent, inputPin: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            await this.authenticationClient.loginWithPinAsync(inputPin.value);
            await this.renderPageAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, this.locale.translateError(error));
        }
    }

    private async onClickLoginWithPass2Async(e: MouseEvent, inputPass2: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            await this.authenticationClient.loginWithPass2Async(inputPass2.value);
            await this.renderPageAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, this.locale.translateError(error));
        }
    }
}