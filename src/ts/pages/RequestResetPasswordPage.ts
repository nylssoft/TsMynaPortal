import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

declare global {
    interface Window {
        frcaptcha: any; // Or specify the correct type if known
    }
}

export class RequestResetPasswordPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "REQUEST_RESET_PASSWORD";

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
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_RESET_PWD"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        // info message
        const infoElem: HTMLDivElement = Controls.createDiv(cardBody, "alert alert-warning");
        infoElem.setAttribute("role", "alert");
        Controls.createParagraph(infoElem, undefined, pageContext.locale.translate("INFO_RESET_PWD"));
        // form
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        // email address
        const divEmailRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divEmail: HTMLDivElement = Controls.createDiv(divEmailRow, "mb-3");
        Controls.createLabel(divEmail, "email-id", "form-label", pageContext.locale.translate("LABEL_EMAIL_ADDRESS"));
        const inputEmail: HTMLInputElement = Controls.createInput(divEmail, "text", "email-id", "form-control");
        inputEmail.setAttribute("autocomplete", "off");
        inputEmail.setAttribute("spellcheck", "false");
        inputEmail.addEventListener("input", (_: Event) => this.enableIfNotEmptyWithCondition("button-continue-id", this.isCaptchaCompleted, "email-id"));
        this.createCaptchaWidget(pageContext, divEmailRow, (ok) => this.enableIfNotEmptyWithCondition("button-continue-id", () => ok, "email-id"));
        // continue button
        const buttonContinue: HTMLButtonElement = Controls.createButton(divEmailRow, "submit", pageContext.locale.translate("BUTTON_CONTINUE"), "btn btn-primary mt-4");
        buttonContinue.disabled = true;
        buttonContinue.addEventListener("click", async (e: Event) => this.onContinue(e, pageContext));
        buttonContinue.id = "button-continue-id";
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    private enableIfNotEmptyWithCondition(buttonid: string, conditionFunc: () => boolean, ...elemIds: string[]) {
        if (elemIds.length > 0) {
            const button: HTMLButtonElement = document.getElementById(buttonid) as HTMLButtonElement;
            const enabled: boolean = conditionFunc() && elemIds.every(id => this.isNotEmpty(document.getElementById(id)));
            if (button.disabled && enabled) {
                button.disabled = false;
            }
            else if (!button.disabled && !enabled) {
                button.disabled = true;
            }
        }
    }

    private isNotEmpty(elem: HTMLElement | null): boolean {
        return elem != null && (elem as HTMLInputElement).value.length > 0;
    }

    // friendly captcha

    private createCaptchaWidget(pageContext: PageContext, parent: HTMLElement, updateFunc: (completed: boolean) => void) {
        const dataSiteKey: string | null = document.body.getAttribute("data-sitekey");
        if (dataSiteKey != null && dataSiteKey.length > 0 && window.frcaptcha) {
            const captchaDiv: HTMLDivElement = Controls.createDiv(parent, "frc-captcha ms-2");
            captchaDiv.setAttribute("data-sitekey", dataSiteKey);
            captchaDiv.setAttribute("lang", `${pageContext.locale.getLanguage()}`);
            captchaDiv.addEventListener("frc:widget.complete", () => updateFunc(true));
            captchaDiv.addEventListener("frc:widget.error", () => updateFunc(false));
            captchaDiv.addEventListener("frc:widget.expire", () => updateFunc(false));
            captchaDiv.addEventListener("frc:widget.statechange", (event: any) => {
                if (event.state != "completed") {
                    updateFunc(false);
                }
            });
            // create captcha widget from div element
            window.frcaptcha.attach(undefined);
        }
    }

    private resetCaptchaWidget() {
        if (window.frcaptcha) {
            const allWidgets = window.frcaptcha.getAllWidgets();
            if (allWidgets.length == 1) {
                allWidgets[0].reset();
            }
        }
    }

    private isCaptchaCompleted(): boolean {
        if (window.frcaptcha) {
            const allWidgets = window.frcaptcha.getAllWidgets();
            if (allWidgets.length == 1) {
                return allWidgets[0].getState() == "completed";
            }
        }
        return true;
    }

    private getCaptchaResponse(): string {
        const captchaInputs: NodeListOf<HTMLElement> = document.getElementsByName("frc-captcha-response");
        if (captchaInputs && captchaInputs.length == 1) {
            return (captchaInputs[0] as HTMLInputElement).value;
        }
        return "";
    }

    // event callbacks

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
        await pageContext.renderAsync();
    }

    private async onContinue(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        try {
            const email: HTMLInputElement = document.getElementById("email-id") as HTMLInputElement;
            const val: string = email.value.trim();
            if (val.length == 0 || !val.includes("@") || !val.includes(".")) {
                throw new Error("ERROR_INVALID_EMAIL");
            }
            const captchaResponse: string = this.getCaptchaResponse();
            await pageContext.authenticationClient.requestPasswordResetAsync(val, pageContext.locale.getLanguage(), captchaResponse);
            pageContext.pageType = "RESET_PASSWORD";
            pageContext.dataChanged = false;
            pageContext.dataEmail = val;
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            this.resetCaptchaWidget();
            this.handleError(error, pageContext);
        }
    }
}