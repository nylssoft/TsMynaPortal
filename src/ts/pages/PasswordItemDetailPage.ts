import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PasswordManagerService } from "../services/PasswordManagerService";
import { PageType, PasswordItemResult, UserInfoResult } from "../TypeDefinitions";

export class PasswordItemDetailPage implements Page {

    hideNavBar?: boolean | undefined = true;

    pageType: PageType = "PASSWORD_ITEM_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        try {
            if (pageContext.passwordItem.edit) {
                await this.renderEditAsync(parent, pageContext);
            } else {
                await this.renderViewAsync(parent, pageContext);
            }
        }
        catch (error: Error | unknown) {
            this.renderError(parent, pageContext, error);
        }
    }

    private renderError(parent: HTMLElement, pageContext: PageContext, error: Error | unknown) {
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_PASSWORDS"));
        Controls.createAlert(Controls.createDiv(parent), pageContext.locale.translateError(error));
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect all data
        const passwordItem: PasswordItemResult = pageContext.passwordItem.result!;
        const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const pwd: string = await PasswordManagerService.getPasswordAsync(user, passwordItem);
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_PASSWORDS"));
        const iEdit: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
        iEdit.setAttribute("role", "button");
        iEdit.addEventListener("click", async (e: MouseEvent) => await this.onEditAsync(e, pageContext));
        const iDelete: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-trash", undefined, "deletebutton-id");
        iDelete.setAttribute("role", "button");
        iDelete.setAttribute("data-bs-target", "#confirmationdialog-id");
        iDelete.setAttribute("data-bs-toggle", "modal");
        // render card
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
            iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(pageContext, passwordItem.Login));
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
            iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(pageContext, pwd));
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
            const cardTextDesciption: HTMLDivElement = Controls.createDiv(cardBody, "card-text");
            const textarea: HTMLTextAreaElement = Controls.createElement(cardTextDesciption, "textarea", "form-control-plaintext", passwordItem.Description) as HTMLTextAreaElement;
            textarea.style.height = "100px";
            textarea.setAttribute("readonly", "true");
        }
        // render delete confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_PASSWORDS"),
            pageContext.locale.translate("INFO_REALLY_DELETE_PASSWORD"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDeleteConfirmationAsync(e, pageContext));
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect data
        const passwordItem: PasswordItemResult | null = pageContext.passwordItem.result;
        const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        let pwd: string | undefined = undefined;
        if (passwordItem?.Password) {
            pwd = await PasswordManagerService.getPasswordAsync(user, passwordItem);
        }
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onEditBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_PASSWORDS"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const inputName: HTMLInputElement = this.createInput(divRows, pageContext, "LABEL_NAME", "name-id", passwordItem?.Name);
        this.createInput(divRows, pageContext, "LABEL_LOGIN", "login-id", passwordItem?.Login);
        this.createPassword(divRows, pageContext, "LABEL_PASSWORD", "password-id", pwd);
        this.createInput(divRows, pageContext, "LABEL_URL", "url-id", passwordItem?.Url);
        this.createTextarea(divRows, pageContext, "LABEL_DESCRIPTION", "description-id", "100px", passwordItem?.Description);
        inputName.focus();
        const saveButton: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
        saveButton.addEventListener("click", async (e: Event) => await this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_PASSWORDS"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => this.onEditBackConfirmation(e, pageContext));
    }

    private createInput(divRows: HTMLDivElement, pageContext: PageContext, label: string, id: string, value?: string): HTMLInputElement {
        return this.createInputControl(divRows, pageContext, "text", label, id, value);
    }

    private createPassword(divRows: HTMLDivElement, pageContext: PageContext, label: string, id: string, value?: string): HTMLInputElement {
        return this.createInputControl(divRows, pageContext, "password", label, id, value);
    }

    private createInputControl(divRows: HTMLDivElement, pageContext: PageContext, type: string, label: string, id: string, value?: string): HTMLInputElement {
        const divInput: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        const labelInput: HTMLLabelElement = Controls.createLabel(divInput, id, "form-label", pageContext.locale.translate(label));
        const input: HTMLInputElement = Controls.createInput(divInput, type, id, "form-control", value);
        input.setAttribute("autocomplete", "off");
        input.setAttribute("spellcheck", "false");
        input.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        if (type == "password") {
            const iconToggle: HTMLElement = Controls.createElement(labelInput, "i", "ms-2 bi bi-eye-slash");
            iconToggle.setAttribute("style", "cursor:pointer;");
            iconToggle.id = "toggle-password-id";
            iconToggle.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, input, iconToggle));
        }
        return input;
    }

    private createTextarea(divRows: HTMLDivElement, pageContext: PageContext, label: string, id: string, height: string, value?: string): HTMLTextAreaElement {
        const divNote: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divNote, id, "form-label", pageContext.locale.translate(label));
        const textarea: HTMLTextAreaElement = Controls.createElement(divNote, "textarea", "form-control", value, id) as HTMLTextAreaElement;
        textarea.style.height = height;
        textarea.setAttribute("spellcheck", "false");
        textarea.setAttribute("autocomplete", "off");
        textarea.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        return textarea;
    }

    private async onEditBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        if (!pageContext.passwordItem.changed) {
            pageContext.passwordItem.edit = false;
            if (pageContext.passwordItem.result == null) {
                pageContext.pageType = "DESKTOP";
            }
            await pageContext.renderAsync();
        }
    }

    private onEditBackConfirmation(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.passwordItem.changed = false;
        document.getElementById("backbutton-id")!.click();
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const name: string = (document.getElementById("name-id")! as HTMLInputElement).value;
        const login: string = (document.getElementById("login-id")! as HTMLInputElement).value;
        const pwd: string = (document.getElementById("password-id")! as HTMLInputElement).value;
        const url: string = (document.getElementById("url-id")! as HTMLInputElement).value;
        const description: string = (document.getElementById("description-id")! as HTMLTextAreaElement).value;
        const passwordItem: PasswordItemResult = {
            Name: name,
            Login: login,
            Password: pwd,
            Url: url,
            Description: description
        };
        await PasswordManagerService.encodePasswordAsync(userInfo, passwordItem);
        if (pageContext.passwordItem.result != null) {
            passwordItem.id = pageContext.passwordItem.result.id;
            pageContext.passwordItem.result = passwordItem;
        }
        await PasswordManagerService.savePasswordItemAsync(token, userInfo, passwordItem);
        pageContext.passwordItem.changed = false;
        document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.passwordItem.changed) {
            pageContext.passwordItem.changed = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DESKTOP";
        pageContext.passwordItem.result = null;
        await pageContext.renderAsync();
    }

    private async onEditAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.passwordItem.edit = true;
        await pageContext.renderAsync();
    }

    private async onDeleteConfirmationAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        await PasswordManagerService.deletePasswordItemAsync(token, userInfo, pageContext.passwordItem.result!.id!);
        document.getElementById("backbutton-id")!.click();
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

    private async copyToClipboardAsync(pageContext: PageContext, text: string): Promise<void> {
        await navigator.clipboard.writeText(text);
        document.getElementById("copy-alert-id")?.classList.add("show");
        window.setTimeout(() => document.getElementById("copy-alert-id")?.classList.remove("show"), 1000);
    }

    private getUrl(item: PasswordItemResult): string {
        if (item.Url.startsWith("http")) {
            return item.Url;
        }
        return `https://${item.Url}`;
    }
}
