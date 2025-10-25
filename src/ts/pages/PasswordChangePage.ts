import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class PasswordChangePage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "PASSWORD_EDIT";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            await this.renderEditAsync(parent, pageContext);
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4, "my-2");
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_CHANGE_PWD"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        // info message
        const infoElem: HTMLDivElement = Controls.createDiv(cardBody, "alert alert-warning");
        infoElem.setAttribute("role", "alert");
        Controls.createParagraph(infoElem, undefined, pageContext.locale.translate("INFO_PWD_STRENGTH"));
        // form
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        // old password
        const divOldPwdRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divOldPwd: HTMLDivElement = Controls.createDiv(divOldPwdRow, "mb-3");
        Controls.createLabel(divOldPwd, "oldpwd-id", "form-label", pageContext.locale.translate("LABEL_OLD_PWD"));
        const inputOldPwd: HTMLInputElement = Controls.createInput(divOldPwd, "password", "oldpwd-id", "form-control");
        inputOldPwd.setAttribute("autocomplete", "off");
        inputOldPwd.setAttribute("spellcheck", "false");
        // new password
        const divNewPwdRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divNewPwd: HTMLDivElement = Controls.createDiv(divNewPwdRow, "mb-3");
        Controls.createLabel(divNewPwd, "newpwd-id", "form-label", pageContext.locale.translate("LABEL_NEW_PWD"));
        const inputNewPwd: HTMLInputElement = Controls.createInput(divNewPwd, "password", "newpwd-id", "form-control");
        inputNewPwd.setAttribute("autocomplete", "off");
        inputNewPwd.setAttribute("spellcheck", "false");
        inputNewPwd.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        // confirm password
        const divConfirmPwdRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divConfirmPwd: HTMLDivElement = Controls.createDiv(divConfirmPwdRow, "mb-3");
        Controls.createLabel(divConfirmPwd, "confirmpwd-id", "form-label", pageContext.locale.translate("LABEL_CONFIRM_PWD"));
        const inputConfirmPwd: HTMLInputElement = Controls.createInput(divConfirmPwd, "password", "confirmpwd-id", "form-control");
        inputConfirmPwd.setAttribute("autocomplete", "off");
        inputConfirmPwd.setAttribute("spellcheck", "false");
        // save button
        const buttonSave: HTMLButtonElement = Controls.createButton(divConfirmPwdRow, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: Event) => this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_CHANGE_PWD"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => this.onBackEdit(e, pageContext));
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    // event callbacks

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        if (!pageContext.settings.passwordChanged) {
            pageContext.pageType = "SETTINGS";
            await pageContext.renderAsync();
        }
    }

    private onBackEdit(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.settings.passwordChanged = false;
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.settings.passwordChanged) {
            pageContext.settings.passwordChanged = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        try {
            const oldpwd: HTMLInputElement = document.getElementById("oldpwd-id") as HTMLInputElement;
            const newpwd: HTMLInputElement = document.getElementById("newpwd-id") as HTMLInputElement;
            const confirmpwd: HTMLInputElement = document.getElementById("confirmpwd-id") as HTMLInputElement;
            if (oldpwd.value.length == 0 || newpwd.value.length == 0) {
                throw new Error("ERROR_MISSING_INPUT");
            }
            if (!pageContext.authenticationClient.verifyPasswordStrength(newpwd.value)) {
                throw new Error("INFO_PWD_NOT_STRONG_ENOUGH");
            }
            if (newpwd.value != confirmpwd.value) {
                throw new Error("INFO_PWD_NOT_MATCH");
            }
            await pageContext.authenticationClient.updatePasswordAsync(oldpwd.value, newpwd.value);
            pageContext.settings.passwordChanged = false;
            await pageContext.authenticationClient.logoutAsync();
            pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
            await pageContext.renderAsync();
            const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
            Controls.createAlert(alertDiv, pageContext.locale.translate("INFO_NEW_PWD_SUCCESS"), "alert-success");
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
            return;
        }
    }
}