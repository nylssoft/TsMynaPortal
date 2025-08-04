
import { TranslationService } from "./TranslationService";
import { AuthenticationService } from "./AuthenticationService";

export class App {
    private static instance: App;

    private translationService: TranslationService = new TranslationService();

    private authenticationService: AuthenticationService = new AuthenticationService();

    private constructor() {
    }

    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    public async runAsync(): Promise<void> {
        this.authenticationService.init();
        await this.translationService.initAsync();
        if (!this.authenticationService.isLoggedIn()) {
            if (this.authenticationService.getRequiresPass2()) {
                this.renderLoginWithPass2();
            } else if (this.authenticationService.getRequiresPin()) {
                this.renderLoginWithPin();
            } else {
                this.renderLoginWithUsernameAndPassword();
            }
        } else {
            console.log("User is already logged in.");
        }
    }

    private renderLoginWithUsernameAndPassword(): void {
        const parent: HTMLElement = document.body;
        App.removeAllChildren(parent);
        const loginDiv: HTMLDivElement = App.createDiv(parent, "container py-4 px-3 mx-auto");
        App.createHeading(loginDiv, 1, "text-center mb-4", this.translationService.translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = App.createForm(loginDiv);
        const alertDiv: HTMLDivElement = App.createDiv(formElement);
        const divUsername: HTMLDivElement = App.createDiv(formElement, "mb-3");
        App.createLabel(divUsername, "username-id", "form-label", this.translationService.translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = App.createInput(divUsername, "text", "username-id", "form-control");
        const divPassword: HTMLDivElement = App.createDiv(formElement, "mb-3");
        App.createLabel(divPassword, "password-id", "form-label", this.translationService.translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = App.createInput(divPassword, "password", "password-id", "form-control");
        const buttonLogin: HTMLButtonElement = App.createButton(formElement, "submit", "login-button-id", this.translationService.translate("BUTTON_LOGIN"), "btn btn-primary");

        const buttonDiv: HTMLDivElement = App.createDiv(loginDiv, "fixed-bottom footer-buttons d-flex justify-content-center gap-2 p-3");
        const germanButton: HTMLButtonElement = App.createButton(buttonDiv, "button", "german-button-id", "", "btn btn-primary");
        germanButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            this.translationService.setLanguage("de");
            await this.translationService.initAsync();
            this.renderLoginWithUsernameAndPassword();
        });
        App.createSpan(germanButton, "fi fi-de");
        const englishButton: HTMLButtonElement = App.createButton(buttonDiv, "button", "english-button-id", "", "btn btn-primary");
        englishButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            this.translationService.setLanguage("en");
            await this.translationService.initAsync();
            this.renderLoginWithUsernameAndPassword();
        });
        App.createSpan(englishButton, "fi fi-gb");

        buttonLogin.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await this.authenticationService.loginAsync(inputUsername.value, inputPassword.value, this.translationService.getLanguage());
            }
            catch (error: Error | unknown) {
                App.createAlert(alertDiv, this.translationService.translateError(error));
            }
        });
    }

    renderLoginWithPass2(): void {
        console.log("Rendering login with pass2.");
    }

    renderLoginWithPin(): void {
        console.log("Rendering login with PIN.");
    }

    static createElement(parent: HTMLElement, name: string, classid?: string, txt?: string): HTMLElement {
        const e: HTMLElement = document.createElement(name);
        if (classid) {
            e.setAttribute("class", classid);
        }
        parent.appendChild(e);
        if (txt) {
            e.textContent = txt;
        }
        return e;
    }

    static createDiv(parent: HTMLElement, classname?: string, txt?: string): HTMLDivElement {
        return App.createElement(parent, "div", classname, txt) as HTMLDivElement;
    }

    static createForm(parent: HTMLElement, classname?: string): HTMLFormElement {
        return App.createElement(parent, "form", classname) as HTMLFormElement;
    }

    static createLabel(parent: HTMLElement, forid: string, classname?: string, txt?: string): HTMLLabelElement {
        const label: HTMLLabelElement = App.createElement(parent, "label", classname) as HTMLLabelElement;
        label.setAttribute("for", forid);
        if (txt) {
            label.textContent = txt;
        }
        return label;
    }

    static createInput(parent: HTMLElement, type: string, id: string, classname?: string, value?: string): HTMLInputElement {
        const input: HTMLInputElement = App.createElement(parent, "input", classname) as HTMLInputElement;
        input.type = type;
        input.id = id;
        if (value) {
            input.value = value;
        }
        return input;
    }

    static createHeading(parent: HTMLElement, level: number, classname?: string, txt?: string): HTMLHeadingElement {
        const h: HTMLHeadingElement = App.createElement(parent, `h${level}`, classname) as HTMLHeadingElement;
        if (txt) {
            h.textContent = txt;
        }
        return h;
    }

    static createButton(parent: HTMLElement, type: string, id: string, txt: string, classname?: string): HTMLButtonElement {
        const b: HTMLButtonElement = App.createElement(parent, "button", classname) as HTMLButtonElement;
        b.setAttribute("type", type);
        b.id = id;
        b.title = txt;
        b.textContent = txt;
        return b;
    }

    static createSpan(parent: HTMLElement, classname?: string, txt?: string): HTMLSpanElement {
        const span: HTMLSpanElement = App.createElement(parent, "span", classname, txt) as HTMLSpanElement;
        return span;
    }

    static createAlert(parent: HTMLElement, msg: string): HTMLDivElement {
        App.removeAllChildren(parent);
        const alertDiv: HTMLDivElement = App.createDiv(parent, "alert alert-danger alert-dismissible");
        alertDiv.setAttribute("role", "alert");
        const alertMessage: HTMLDivElement = App.createDiv(alertDiv, "", msg);
        const alertButton: HTMLButtonElement = App.createButton(alertDiv, "button", "close-alert-id", "", "btn-close");
        alertButton.setAttribute("data-bs-dismiss", "alert");
        alertButton.setAttribute("aria-label", "Close");
        return alertDiv;
    }

    static removeAllChildren(parent: HTMLElement): void {
        const node: HTMLElement = parent;
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }

}