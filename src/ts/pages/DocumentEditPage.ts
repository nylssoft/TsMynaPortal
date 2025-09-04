import { Page, PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class DocumentEditPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "DOCUMENT_EDIT";

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
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_DOCUMENTS"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divName: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divName, "name-id", "form-label", pageContext.locale.translate("LABEL_NAME"));
        const value: string | undefined = pageContext.documentItem.edit?.name;
        const inputName: HTMLInputElement = Controls.createInput(divName, "text", "name-id", "form-control", value);
        inputName.setAttribute("autocomplete", "off");
        inputName.setAttribute("spellcheck", "false");
        inputName.focus();
        inputName.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        const buttonSave: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: Event) => this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_NOTES"),
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
        if (!pageContext.documentItem.changed) {
            pageContext.documentItem.edit = null
            pageContext.pageType = "DESKTOP";
            await pageContext.renderAsync();
        }
    }

    private onBackEdit(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.documentItem.changed = false;
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.documentItem.changed) {
            pageContext.documentItem.changed = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const name: string = (document.getElementById("name-id") as HTMLInputElement).value.trim();
        if (name.length > 0) {
            try {
                const token: string = pageContext.authenticationClient.getToken()!;
                if (pageContext.documentItem.edit != null) {
                    await DocumentService.renameItemAsync(token, pageContext.documentItem.edit.id, name);
                } else {
                    await DocumentService.createFolderAsync(token, pageContext.documentItem.containerId!, name);
                }
                pageContext.documentItem.edit = null
                pageContext.documentItem.changed = false;
                pageContext.pageType = "DESKTOP";
                await pageContext.renderAsync();
            }
            catch (error: Error | unknown) {
                this.handleError(error, pageContext);
            }
        }
    }
}