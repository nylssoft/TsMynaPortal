import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class PinEditPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "PIN_EDIT";

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
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("OPTION_PIN"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        // info message
        const infoElem: HTMLDivElement = Controls.createDiv(cardBody, "alert alert-warning");
        infoElem.setAttribute("role", "alert");
        Controls.createParagraph(infoElem, undefined, pageContext.locale.translate("INFO_PIN"));
        // form
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        // pin input
        const divPinRow: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divPin: HTMLDivElement = Controls.createDiv(divPinRow, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", pageContext.locale.translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        inputPin.setAttribute("autocomplete", "off");
        inputPin.setAttribute("spellcheck", "false");
        inputPin.focus();
        inputPin.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        // save button
        const buttonSave: HTMLButtonElement = Controls.createButton(divPinRow, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: Event) => this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("OPTION_PIN"),
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
        if (!pageContext.settings.pinChanged) {
            pageContext.pageType = "SETTINGS";
            await pageContext.renderAsync();
        }
    }

    private onBackEdit(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.settings.pinChanged = false;
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.settings.pinChanged) {
            pageContext.settings.pinChanged = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const pin: string = (document.getElementById("pin-id") as HTMLInputElement).value.trim();
        if (pin.length > 0) {
            try {
                if (pin.length < 4 || pin.length > 6 || isNaN(parseInt(pin))) {
                    throw new Error("INFO_PIN_NOK");
                }
                await pageContext.authenticationClient.updatePinAsync(pin);
                pageContext.settings.pinChanged = false;
                pageContext.pageType = "SETTINGS";
                await pageContext.renderAsync();
            }
            catch (error: Error | unknown) {
                this.handleError(error, pageContext);
            }
        }
    }
}