import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { UserInfoResult } from "../TypeDefinitions";
import { Security } from "../Security";

export class EncryptionKey {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("ENCRYPTION_KEY"));
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent);

        const keyDiv: HTMLDivElement = Controls.createDiv(formElement, "mb-3");
        Controls.createLabel(keyDiv, "key-id", "form-label", pageContext.getLocale().translate("LABEL_KEY"));
        const keyPwd: HTMLInputElement = Controls.createInput(keyDiv, "password", "key-id", "form-control");
        keyPwd.setAttribute("aria-describedby", "keyhelp-id");
        const helpDiv: HTMLDivElement = Controls.createDiv(keyDiv, "form-text", pageContext.getLocale().translate("INFO_ENTER_KEY"));
        helpDiv.id = "keyhelp-id";

        const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        let encKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encKey != null) {
            keyPwd.value = encKey;
        }
        
        const buttonSave: HTMLButtonElement = Controls.createButton(formElement, "submit", "save-button-id", pageContext.getLocale().translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: MouseEvent) => this.onClickSaveAsync(e, pageContext, keyPwd, alertDiv));
    }

    private static async onClickSaveAsync(e: MouseEvent, pageContext: PageContext, keyPwd: HTMLInputElement, alertDiv: HTMLDivElement) {
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