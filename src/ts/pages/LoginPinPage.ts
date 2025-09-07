import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { Security } from "../utils/Security";
import { PageType, UserInfoResult } from "../TypeDefinitions";

/**
 * Page implementation for the Login with PIN page.
 */
export class LoginPinPage implements Page {

    pageType: PageType = "LOGIN_PIN";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divPin: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", pageContext.locale.translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        inputPin.setAttribute("aria-describedby", "pinhelp-id");
        inputPin.setAttribute("autocomplete", "off");
        inputPin.setAttribute("spellcheck", "false");
        inputPin.focus();
        const pinHelpDiv: HTMLDivElement = Controls.createDiv(divPin, "form-text", pageContext.locale.translate("INFO_ENTER_PIN"));
        pinHelpDiv.id = "pinhelp-id";
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPinAsync(e, pageContext, inputPin, alertDiv));
    }

    private async onClickLoginWithPinAsync(e: MouseEvent, pageContext: PageContext, inputPin: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.authenticationClient.getLongLivedToken() == null) {
                pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
            } else {
                await pageContext.authenticationClient.loginWithPinAsync(inputPin.value);
                const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                    pageContext.pageType = "DATA_PROTECTION";
                } else {
                    pageContext.pageType = "DESKTOP";
                }
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}