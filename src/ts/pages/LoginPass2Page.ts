import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { Security } from "../utils/Security";
import { PageType, UserInfoResult } from "../TypeDefinitions";

/**
 * Page implementation for the Login with Pass2 page.
 */
export class LoginPass2Page implements Page {

    pageType: PageType = "LOGIN_PASS2";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divPass2: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPass2, "pass2-id", "form-label", pageContext.locale.translate("LABEL_SEC_KEY"));
        const inputPass2: HTMLInputElement = Controls.createInput(divPass2, "text", "pass2-id", "form-control");
        inputPass2.setAttribute("aria-describedby", "pass2help-id");
        inputPass2.setAttribute("autocomplete", "off");
        inputPass2.setAttribute("spellcheck", "false");
        inputPass2.focus();
        const pass2HelpDiv: HTMLDivElement = Controls.createDiv(divPass2, "form-text", pageContext.locale.translate("INFO_ENTER_SEC_KEY"));
        pass2HelpDiv.id = "pass2help-id";
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPass2Async(e, pageContext, inputPass2, alertDiv));
    }

    private async onClickLoginWithPass2Async(e: MouseEvent, pageContext: PageContext, inputPass2: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.authenticationClient.getToken() == null) {
                pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
            } else {
                await pageContext.authenticationClient.loginWithPass2Async(inputPass2.value);
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
