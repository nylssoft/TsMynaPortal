import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { Security } from "../Security";
import { UserInfoResult } from "../TypeDefinitions";

export class LoginUsernamePassword {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
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

    private static async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, pageContext: PageContext, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, staySignedIn: HTMLInputElement, alertDiv: HTMLDivElement) {
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