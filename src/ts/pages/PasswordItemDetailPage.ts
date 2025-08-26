import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PasswordManagerService } from "../services/PasswordManagerService";
import { PageType, PasswordItemResult, UserInfoResult } from "../TypeDefinitions";

export class PasswordItemDetailPage implements Page {

    hideNavBar?: boolean | undefined = true;

    pageType: PageType = "PASSWORD_ITEM_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const passwordItem: PasswordItemResult = pageContext.getPasswordItem()!;
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const pwd: string = await PasswordManagerService.getPasswordAsync(user, passwordItem);
            const card = Controls.createDiv(parent, "card p-4 shadow-sm");
            card.style.maxWidth = "600px";
            const copyAlert: HTMLDivElement = Controls.createDiv(parent, "mt-5 text-center alert alert-success fade")
            copyAlert.style.maxWidth = "600px";
            copyAlert.id = "copy-alert-id";
            copyAlert.setAttribute("role", "alert");
            Controls.createDiv(copyAlert, "", pageContext.locale.translate("COPIED_TO_CLIPBOARD"));
            const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
            Controls.createHeading(cardBody, 2, "card-title mb-3", passwordItem.Name);
            if (passwordItem.Login.length > 0) {
                const cardTextLogin: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextLogin, "bi bi-person");
                const inputLogin: HTMLInputElement = Controls.createInput(cardTextLogin, "text", "login-id", "ms-2 border-0", passwordItem.Login);
                inputLogin.setAttribute("readonly", "true");
                inputLogin.setAttribute("autocomplete", "off");
                inputLogin.setAttribute("spellcheck", "false");
                const iconCopy: HTMLElement = Controls.createElement(cardTextLogin, "i", "ms-2 bi bi-clipboard");
                iconCopy.setAttribute("style", "cursor:pointer;");
                iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(pageContext, alertDiv, passwordItem.Login));
            }
            if (pwd.length > 0) {
                const cardTextPassword: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextPassword, "bi bi-shield-lock");
                const inputPassword: HTMLInputElement = Controls.createInput(cardTextPassword, "password", "password-id", "ms-2 border-0", pwd);
                inputPassword.setAttribute("readonly", "true");
                inputPassword.setAttribute("autocomplete", "off");
                inputPassword.setAttribute("spellcheck", "false");
                const iconCopy: HTMLElement = Controls.createElement(cardTextPassword, "i", "ms-2 bi bi-clipboard");
                iconCopy.setAttribute("style", "cursor:pointer;");
                iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(pageContext, alertDiv, pwd));
                const iconToggle: HTMLElement = Controls.createElement(cardTextPassword, "i", "ms-2 bi bi-eye-slash");
                iconToggle.setAttribute("style", "cursor:pointer;");
                iconToggle.id = "toggle-password-id";
                iconToggle.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, inputPassword, iconToggle));
            }
            if (passwordItem.Url.length > 0) {
                const cardTextUrl: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextUrl, "bi bi-link-45deg");
                const aUrl = Controls.createAnchor(cardTextUrl, this.getUrl(passwordItem), passwordItem.Url, "ms-2");
                aUrl.setAttribute("target", "_blank");
            }
            if (passwordItem.Description.length > 0) {
                const cardTextDesc: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextDesc, "bi bi-card-text");
                Controls.createSpan(cardTextDesc, "ms-2", passwordItem.Description);
            }
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_BACK"), "btn btn-primary");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "DESKTOP";
                pageContext.setPasswordItem(null);
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private onTogglePassword(e: MouseEvent, inputPwd: HTMLInputElement, icon: HTMLElement) {
        e.preventDefault();
        if (inputPwd.type == "password") {
            inputPwd.type = "text";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        } else {
            inputPwd.type = "password";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        }
    }

    private async copyToClipboardAsync(pageContext: PageContext, alertDiv: HTMLDivElement, text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
            document.getElementById("copy-alert-id")?.classList.add("show");
            window.setTimeout(() => document.getElementById("copy-alert-id")?.classList.remove("show"), 1000);
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private getUrl(item: PasswordItemResult): string {
        if (item.Url.startsWith("http")) {
            return item.Url;
        }
        return `https://${item.Url}`;
    }
}
