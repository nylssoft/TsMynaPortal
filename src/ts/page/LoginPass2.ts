import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { UserInfoResult } from "../TypeDefinitions";
import { Security } from "../Security";

export class LoginPass2 {

    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
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
        const pass2HelpDiv: HTMLDivElement = Controls.createDiv(divPass2, "form-text", pageContext.getLocale().translate("INFO_ENTER_SEC_KEY"));
        pass2HelpDiv.id = "pass2help-id";

        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPass2Async(e, pageContext, inputPass2, alertDiv));
    }

    private static async onClickLoginWithPass2Async(e: MouseEvent, pageContext: PageContext, inputPass2: HTMLInputElement, alertDiv: HTMLDivElement) {
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