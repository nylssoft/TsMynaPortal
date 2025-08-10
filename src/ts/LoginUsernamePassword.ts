import { PageContext } from "./PageContext";
import { Controls } from "./Controls";

export class LoginUsernamePassword {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("HEADER_LOGIN"));
        const formElement: HTMLFormElement = Controls.createForm(parent);

        const divUsername: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", pageContext.getLocale().translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        inputUsername.setAttribute("aria-describedby", "usernamehelp-id");
        const usernameHelpDiv: HTMLDivElement = Controls.createDiv(divUsername, "form-text", pageContext.getLocale().translate("INFO_ENTER_USERNAME"));
        usernameHelpDiv.id = "usernamehelp-id";

        const divPassword: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", pageContext.getLocale().translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        inputPassword.setAttribute("aria-describedby", "passwordhelp-id");
        const passwordHelpDiv: HTMLDivElement = Controls.createDiv(divPassword, "form-text", pageContext.getLocale().translate("INFO_ENTER_PASSWORD"));
        passwordHelpDiv.id = "passwordhelp-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(formElement, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_CONTINUE"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithUsernameAndPasswordAsync(e, pageContext, inputUsername, inputPassword, alertDiv));
    }

    private static async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, pageContext: PageContext, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            await pageContext.getAuthenticationClient().loginAsync(inputUsername.value, inputPassword.value, pageContext.getLocale().getLanguage());
            if (pageContext.getAuthenticationClient().isRequiresPin()) {
                pageContext.setPageType("LOGIN_PIN");
            } else if (pageContext.getAuthenticationClient().isRequiresPass2()) {
                pageContext.setPageType("LOGIN_PASS2");
            } else {
                pageContext.setPageType("INBOX");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

}