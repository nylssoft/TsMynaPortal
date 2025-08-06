
import { Locale } from "./Locale";
import { AuthenticationClient } from "./AuthenticationClient";
import { Controls } from "./Controls";

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
        this.renderPage();
    }

    private renderPage(): void {
        Controls.removeAllChildren(document.body);
        const parent: HTMLDivElement = Controls.createDiv(document.body, "container py-4 px-3 mx-auto");
        if (!this.authenticationClient.isLoggedIn()) {
            if (this.authenticationClient.isRequiresPass2()) {
                this.renderLoginWithPass2(parent);
            } else if (this.authenticationClient.isRequiresPin()) {
                this.renderLoginWithPin(parent);
            } else {
                this.renderLoginWithUsernameAndPassword(parent);
            }
        } else {
            this.renderMain(parent)
        }
        this.renderLanguageButtons(parent);
    }

    private renderLoginWithUsernameAndPassword(parent: HTMLElement): void {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("APP_NAME"));
        const formElement: HTMLFormElement = Controls.createForm(parent);
        const divUsername: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", this.locale.translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        const divPassword: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", this.locale.translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await this.authenticationClient.loginAsync(inputUsername.value, inputPassword.value, this.locale.getLanguage());
                this.renderPage();
            }
            catch (error: Error | unknown) {
                Controls.createAlert(alertDiv, this.locale.translateError(error));
            }
        });
    }

    private renderLoginWithPass2(parent: HTMLElement): void {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent);
        const divPass2: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPass2, "pass2-id", "form-label", this.locale.translate("LABEL_SEC_KEY"));
        const inputPass2: HTMLInputElement = Controls.createInput(divPass2, "text", "pass2-id", "form-control");
        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await this.authenticationClient.loginWithPass2Async(inputPass2.value);
                this.renderPage();
            }
            catch (error: Error | unknown) {
                Controls.createAlert(alertDiv, this.locale.translateError(error));
            }
        });
    }

    private renderLoginWithPin(parent: HTMLElement): void {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent);
        const divPin: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", this.locale.translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await this.authenticationClient.loginWithPinAsync(inputPin.value);
                this.renderPage();
            }
            catch (error: Error | unknown) {
                Controls.createAlert(alertDiv, this.locale.translateError(error));
            }
        });
    }

    private renderMain(parent: HTMLElement): void {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", this.locale.translate("HEADER_MAIN"));
        const welcomeMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        welcomeMessage.textContent = this.locale.translate("MESSAGE_WELCOME");
        const buttonLogout: HTMLButtonElement = Controls.createButton(parent, "button", "logout-button-id", this.locale.translate("BUTTON_LOGOUT"), "btn btn-primary");
        buttonLogout.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await this.authenticationClient.logoutAsync();
                this.renderPage();
            }
            catch (error: Error | unknown) {
                Controls.createAlert(alertDiv, this.locale.translateError(error));
            }
        });
    }

    private renderLanguageButtons(parent: HTMLElement): void {
        const buttonDiv: HTMLDivElement = Controls.createDiv(parent, "fixed-bottom footer-buttons d-flex justify-content-center gap-2 p-3");
        const germanButton: HTMLButtonElement = Controls.createButton(buttonDiv, "button", "german-button-id", "", "btn btn-primary");
        germanButton.addEventListener("click", async (e: MouseEvent) => this.onLanguageChangeAsync(e, "de"));
        Controls.createSpan(germanButton, "fi fi-de");
        const englishButton: HTMLButtonElement = Controls.createButton(buttonDiv, "button", "english-button-id", "", "btn btn-primary");
        englishButton.addEventListener("click", async (e: MouseEvent) => this.onLanguageChangeAsync(e, "en"));
        Controls.createSpan(englishButton, "fi fi-gb");
    }

    private async onLanguageChangeAsync(e: MouseEvent, languageCode: string): Promise<void> {
        e.preventDefault();
        await this.locale.setLanguageAsync(languageCode);
        this.renderPage();
    }

}