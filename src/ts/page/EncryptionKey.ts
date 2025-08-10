import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { UserInfoResult } from "../TypeDefinitions";
import { Security } from "../Security";

export class EncryptionKey {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        let encKey: string | null = await Security.getEncryptionKeyAsync(user);
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

    private static async onTogglePassword(e: MouseEvent, keyPwd: HTMLInputElement, icon: HTMLElement) {
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