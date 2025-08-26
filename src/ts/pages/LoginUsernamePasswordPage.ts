import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { Security } from "../utils/Security";
import { PageType, UserInfoResult } from "../TypeDefinitions";

/**
 * Page implementation for the Login with Username and Password page.
 */
export class LoginUsernamePasswordPage implements Page {

    pageType: PageType = "LOGIN_USERNAME_PASSWORD";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divUsername: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", pageContext.locale.translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        inputUsername.setAttribute("aria-describedby", "usernamehelp-id");
        inputUsername.setAttribute("autocomplete", "off");
        inputUsername.setAttribute("spellcheck", "false");
        inputUsername.focus();
        const usernameHelpDiv: HTMLDivElement = Controls.createDiv(divUsername, "form-text", pageContext.locale.translate("INFO_ENTER_USERNAME"));
        usernameHelpDiv.id = "usernamehelp-id";
        const divPassword: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", pageContext.locale.translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        inputPassword.setAttribute("aria-describedby", "passwordhelp-id");
        inputPassword.setAttribute("autocomplete", "off");
        inputPassword.setAttribute("spellcheck", "false");
        const passwordHelpDiv: HTMLDivElement = Controls.createDiv(divPassword, "form-text", pageContext.locale.translate("INFO_ENTER_PASSWORD"));
        passwordHelpDiv.id = "passwordhelp-id";
        const divSaySignedIn: HTMLDivElement = Controls.createDiv(divRows, "mb-3 form-check");
        const inputStaySignedIn: HTMLInputElement = Controls.createInput(divSaySignedIn, "checkbox", "staysignedin-id", "form-check-input");
        Controls.createLabel(divSaySignedIn, "staysignedin-id", "form-check-label", pageContext.locale.translate("STAY_SIGNED_IN"));
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithUsernameAndPasswordAsync(e, pageContext, inputUsername, inputPassword, inputStaySignedIn, alertDiv));
    }

    private async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, pageContext: PageContext, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, staySignedIn: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            pageContext.authenticationClient.setUseLongLivedToken(staySignedIn.checked);
            await pageContext.authenticationClient.loginAsync(inputUsername.value, inputPassword.value, pageContext.locale.getLanguage());
            if (pageContext.authenticationClient.isRequiresPass2()) {
                pageContext.pageType = "LOGIN_PASS2";
            } else {
                const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.pageType = "DESKTOP";
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}