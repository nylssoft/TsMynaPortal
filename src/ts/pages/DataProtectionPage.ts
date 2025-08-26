import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { Security } from "../utils/Security";
import { PageType, UserInfoResult } from "../TypeDefinitions";

/**
 * Page implementation for the Encryption Key page.
 */
export class DataProtectionPage implements Page {

    pageType: PageType = "DATA_PROTECTION";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const encKey: string | null = await Security.getEncryptionKeyAsync(user);
            const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
            card.style.maxWidth = "400px";
            const infoDiv: HTMLDivElement = Controls.createDiv(card, "alert alert-warning", pageContext.locale.translate("KEY_INFO"));
            infoDiv.setAttribute("role", "alert");
            const formElement: HTMLFormElement = Controls.createForm(card);
            const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
            const divCol1: HTMLDivElement = Controls.createDiv(divRows, "col");
            Controls.createLabel(divCol1, "key-id", "form-label", pageContext.locale.translate("LABEL_KEY"));
            const keyPwd: HTMLInputElement = Controls.createInput(divCol1, "password", "key-id", "form-control");
            keyPwd.setAttribute("aria-describedby", "keyhelp-id");
            keyPwd.setAttribute("autocomplete", "off");
            keyPwd.setAttribute("spellcheck", "false");
            if (encKey != null) {
                keyPwd.value = encKey;
            }
            const divCol2: HTMLDivElement = Controls.createDiv(divRows, "col-auto align-self-end");
            const icon: HTMLElement = Controls.createElement(divCol2, "i", "bi bi-eye-slash");
            icon.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
            icon.id = "toggle-password-id";
            const helpDiv: HTMLDivElement = Controls.createDiv(divRows, "form-text", pageContext.locale.translate("INFO_ENTER_KEY"));
            helpDiv.id = "keyhelp-id";
            const buttonSave: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary");
            buttonSave.addEventListener("click", async (e: MouseEvent) => this.onClickSaveAsync(e, pageContext, keyPwd, alertDiv));
            icon.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, keyPwd, icon));
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private onTogglePassword(e: MouseEvent, keyPwd: HTMLInputElement, icon: HTMLElement) {
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
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            await Security.setEncryptionKeyAsync(user, keyPwd.value);
            pageContext.pageType = "DESKTOP";
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}