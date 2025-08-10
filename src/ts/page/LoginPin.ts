import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { UserInfoResult } from "../TypeDefinitions";
import { Security } from "../Security";

export class LoginPin {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
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
        const pinHelpDiv: HTMLDivElement = Controls.createDiv(divPin, "form-text", pageContext.getLocale().translate("INFO_ENTER_PIN"));
        pinHelpDiv.id = "pinhelp-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPinAsync(e, pageContext, inputPin, alertDiv));
    }

    private static async onClickLoginWithPinAsync(e: MouseEvent, pageContext: PageContext, inputPin: HTMLInputElement, alertDiv: HTMLDivElement) {
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