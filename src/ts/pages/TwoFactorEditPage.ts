import { UserInfo } from "os";
import { Page, PageContext } from "../PageContext";
import { PageType, TwoFactorResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class TwoFactorEditPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "TWO_FACTOR_EDIT";

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
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const twoFactor: TwoFactorResult = await pageContext.authenticationClient.getTwoFactorAsync(true);
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4, "my-2");
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("OPTION_TWO_FACTOR"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        // info message
        const infoElem: HTMLDivElement = Controls.createDiv(cardBody, "alert alert-warning");
        infoElem.setAttribute("role", "alert");
        Controls.createParagraph(infoElem, undefined, pageContext.locale.translate("INFO_INSTALL_GOOGLE_AUTH"));
        Controls.createParagraph(infoElem, undefined, pageContext.locale.translate("INFO_ACTIVATE_TWO_FACTOR"));
        // form
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divQrCodeKeyRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        Controls.createDiv(divQrCodeKeyRow, "mb-3", pageContext.locale.translateWithArgs("INFO_SEC_KEY_1", [twoFactor.secretKey]));
        const divQrCodeRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divQrCode: HTMLDivElement = Controls.createDiv(divQrCodeRow, "mb-3");
        const url = `otpauth://totp/${twoFactor.issuer}:${userInfo.email}?secret=${twoFactor.secretKey}&issuer=${twoFactor.issuer}&algorithm=SHA1&digits=6&period=30`;
        const colorLight: string = pageContext.theme.isLight() ? "#ffffff" : "#000000";
        const colorDark: string = pageContext.theme.isLight() ? "#000000" : "#ffffff";
        new QRCode(divQrCode, {
            text: url,
            width: 128,
            height: 128,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRCode.CorrectLevel.H
        });
        // code input
        const divCodeRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divCode: HTMLDivElement = Controls.createDiv(divCodeRow, "mb-3");
        Controls.createLabel(divCode, "code-id", "form-label", pageContext.locale.translate("LABEL_SEC_KEY"));
        const inputCode: HTMLInputElement = Controls.createInput(divCode, "text", "code-id", "form-control");
        inputCode.setAttribute("autocomplete", "off");
        inputCode.setAttribute("spellcheck", "false");
        inputCode.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        // save button
        const buttonSave: HTMLButtonElement = Controls.createButton(divCodeRow, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: Event) => this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("OPTION_TWO_FACTOR"),
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
        if (!pageContext.settings.twoFactorChanged) {
            pageContext.pageType = "SETTINGS";
            await pageContext.renderAsync();
        }
    }

    private onBackEdit(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.settings.twoFactorChanged = false;
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.settings.twoFactorChanged) {
            pageContext.settings.twoFactorChanged = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const code: string = (document.getElementById("code-id") as HTMLInputElement).value.trim();
        if (code.length > 0) {
            try {
                await pageContext.authenticationClient.enableTwoFactorAsync(code);
                pageContext.settings.twoFactorChanged = false;
                pageContext.pageType = "SETTINGS";
                await pageContext.renderAsync();
            }
            catch (error: Error | unknown) {
                this.handleError(error, pageContext);
            }
        }
    }
}