import { Controls } from "./Controls";
import { PageContext, Page } from "./PageContext";
import { Security } from "./Security";
import { UserInfoResult } from "./TypeDefinitions";

/**
 * Page implementation for the About page.
 */
export class AboutPage implements Page {
    
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "container py-4 px-3 mx-auto");
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("ABOUT"));
        const aboutMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        aboutMessage.textContent = `Version 0.0.1 ${pageContext.getLocale().translate("TEXT_COPYRIGHT_YEAR")} ${pageContext.getLocale().translate("COPYRIGHT")}`;
    }
}

/**
 * Page implementation for the Encryption Key page.
 */
export class EncryptionKeyPage implements Page {
    
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        const encKey: string | null = await Security.getEncryptionKeyAsync(user);
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("ENCRYPTION_KEY"));
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const infoDiv: HTMLDivElement = Controls.createDiv(parent, "alert alert-warning", pageContext.getLocale().translate("KEY_INFO"));
        infoDiv.setAttribute("role", "alert");
        const formElement: HTMLFormElement = Controls.createForm(parent);
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divCol1: HTMLDivElement = Controls.createDiv(divRows, "col");
        Controls.createLabel(divCol1, "key-id", "form-label", pageContext.getLocale().translate("LABEL_KEY"));
        const keyPwd: HTMLInputElement = Controls.createInput(divCol1, "password", "key-id", "form-control");
        keyPwd.setAttribute("aria-describedby", "keyhelp-id");
        if (encKey != null) {
            keyPwd.value = encKey;
        }
        const divCol2: HTMLDivElement = Controls.createDiv(divRows, "col-auto align-self-end");
        const icon: HTMLElement = Controls.createElement(divCol2, "i", "bi bi-eye-slash");
        icon.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
        icon.id = "toggle-password-id";
        const helpDiv: HTMLDivElement = Controls.createDiv(divRows, "form-text", pageContext.getLocale().translate("INFO_ENTER_KEY"));
        helpDiv.id = "keyhelp-id";
        const buttonSave: HTMLButtonElement = Controls.createButton(divRows, "submit", "save-button-id", pageContext.getLocale().translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: MouseEvent) => this.onClickSaveAsync(e, pageContext, keyPwd, alertDiv));
        icon.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, keyPwd, icon));
    }

    private async onTogglePassword(e: MouseEvent, keyPwd: HTMLInputElement, icon: HTMLElement) {
        e.preventDefault();
        if (keyPwd.type == "password") {
            keyPwd.type = "text";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        } else {
            keyPwd.type = "password";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        }
    }

    private async onClickSaveAsync(e: MouseEvent, pageContext: PageContext, keyPwd: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            await Security.setEncryptionKeyAsync(user, keyPwd.value);
            pageContext.setPageType("INBOX");
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Inbox page.
 */
export class InboxPage implements Page {
    
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("INBOX"));
        const welcomeMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        welcomeMessage.textContent = pageContext.getLocale().translateWithArgs("MESSAGE_WELCOME_1", [userInfo.name]);
    }
}

/**
 * Page implementation for the Login with Pass2 page.
 */
export class LoginPass2Page implements Page {

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");

        const divPass2: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPass2, "pass2-id", "form-label", pageContext.getLocale().translate("LABEL_SEC_KEY"));
        const inputPass2: HTMLInputElement = Controls.createInput(divPass2, "text", "pass2-id", "form-control");
        inputPass2.setAttribute("aria-describedby", "pass2help-id");
        inputPass2.focus();
        const pass2HelpDiv: HTMLDivElement = Controls.createDiv(divPass2, "form-text", pageContext.getLocale().translate("INFO_ENTER_SEC_KEY"));
        pass2HelpDiv.id = "pass2help-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPass2Async(e, pageContext, inputPass2, alertDiv));
    }

    private async onClickLoginWithPass2Async(e: MouseEvent, pageContext: PageContext, inputPass2: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.getAuthenticationClient().getToken() == null) {
                pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
            } else {
                await pageContext.getAuthenticationClient().loginWithPass2Async(inputPass2.value);
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("INBOX");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Login with PIN page.
 */
export class LoginPinPage implements Page {
    
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("HEADER_LOGIN"));
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");

        const divPin: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", pageContext.getLocale().translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        inputPin.setAttribute("aria-describedby", "pinhelp-id");
        inputPin.focus();
        const pinHelpDiv: HTMLDivElement = Controls.createDiv(divPin, "form-text", pageContext.getLocale().translate("INFO_ENTER_PIN"));
        pinHelpDiv.id = "pinhelp-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPinAsync(e, pageContext, inputPin, alertDiv));
    }

    private async onClickLoginWithPinAsync(e: MouseEvent, pageContext: PageContext, inputPin: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.getAuthenticationClient().getLongLivedToken() == null) {
                pageContext.setPageType("LOGIN_USERNAME_PASSWORD");            
            } else {
                await pageContext.getAuthenticationClient().loginWithPinAsync(inputPin.value);
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("INBOX");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Login with Username and Password page.
 */
export class LoginUsernamePasswordPage implements Page {
    
    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divUsername: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", pageContext.getLocale().translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        inputUsername.setAttribute("aria-describedby", "usernamehelp-id");
        inputUsername.focus();
        const usernameHelpDiv: HTMLDivElement = Controls.createDiv(divUsername, "form-text", pageContext.getLocale().translate("INFO_ENTER_USERNAME"));
        usernameHelpDiv.id = "usernamehelp-id";

        const divPassword: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", pageContext.getLocale().translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        inputPassword.setAttribute("aria-describedby", "passwordhelp-id");
        const passwordHelpDiv: HTMLDivElement = Controls.createDiv(divPassword, "form-text", pageContext.getLocale().translate("INFO_ENTER_PASSWORD"));
        passwordHelpDiv.id = "passwordhelp-id";

        const divSaySignedIn: HTMLDivElement = Controls.createDiv(divRows, "mb-3 form-check");
        const inputStaySignedIn: HTMLInputElement = Controls.createInput(divSaySignedIn, "checkbox", "staysignedin-id", "form-check-input");
        Controls.createLabel(divSaySignedIn, "staysignedin-id", "form-check-label", pageContext.getLocale().translate("STAY_SIGNED_IN"));

        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithUsernameAndPasswordAsync(e, pageContext, inputUsername, inputPassword, inputStaySignedIn, alertDiv));
    }

    private async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, pageContext: PageContext, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, staySignedIn: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            pageContext.getAuthenticationClient().setUseLongLivedToken(staySignedIn.checked);            
            await pageContext.getAuthenticationClient().loginAsync(inputUsername.value, inputPassword.value, pageContext.getLocale().getLanguage());
            if (pageContext.getAuthenticationClient().isRequiresPass2()) {
                pageContext.setPageType("LOGIN_PASS2");
            } else {
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("INBOX");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}