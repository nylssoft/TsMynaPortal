import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { ContactResult, PageType, UserInfoResult } from "../TypeDefinitions";
import { ContactService } from "../services/ContactService";

/**
 * Page implementation for the Contact Detail page.
 * It displays detailed information about a specific contact, including name, phone, address, email, birthday, and notes.
 * It also provides a back button to return to the Desktop page.
 */
export class ContactDetailPage implements Page {

    hideNavBar?: boolean | undefined = true;

    pageType: PageType = "CONTACT_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        try {
            if (pageContext.contact.edit) {
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
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_CONTACTS"));
        Controls.createAlert(Controls.createDiv(parent), pageContext.locale.translateError(error));
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const contact: ContactResult = pageContext.contact.result!;
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: MouseEvent) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_CONTACTS"));
        const iEdit: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
        iEdit.setAttribute("role", "button");
        iEdit.addEventListener("click", async (e: MouseEvent) => await this.onEditAsync(e, pageContext));
        const iDelete: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-trash", undefined, "deletebutton-id");
        iDelete.setAttribute("role", "button");
        iDelete.setAttribute("data-bs-target", "#confirmationdialog-id");
        iDelete.setAttribute("data-bs-toggle", "modal");
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        Controls.createHeading(cardBody, 2, "card-title mb-3", contact.name);
        if (contact.phone.length > 0) {
            const divRow: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
            const divCol1: HTMLDivElement = Controls.createDiv(divRow, "col-1 mt-2");
            Controls.createElement(divCol1, "i", "bi bi-telephone");
            const divCol2: HTMLDivElement = Controls.createDiv(divRow, "col-11");
            const inputPhone: HTMLInputElement = Controls.createInput(divCol2, "text", "phone-id", "form-control-plaintext", contact.phone);
            inputPhone.setAttribute("readonly", "true");
        }
        if (contact.address.length > 0) {
            const divRow: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
            const divCol1: HTMLDivElement = Controls.createDiv(divRow, "col-1 mt-2");
            Controls.createElement(divCol1, "i", "bi bi-geo-alt");
            const divCol2: HTMLDivElement = Controls.createDiv(divRow, "col-11");
            const inputAddress: HTMLInputElement = Controls.createInput(divCol2, "text", "address-id", "form-control-plaintext", contact.address);
            inputAddress.setAttribute("readonly", "true");
        }
        if (contact.email.length > 0) {
            const divRow: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
            const divCol1: HTMLDivElement = Controls.createDiv(divRow, "col-1 mt-2");
            Controls.createElement(divCol1, "i", "bi bi-envelope");
            const divCol2: HTMLDivElement = Controls.createDiv(divRow, "col-11");
            const inputEmail: HTMLInputElement = Controls.createInput(divCol2, "text", "email-id", "form-control-plaintext", contact.email);
            inputEmail.setAttribute("readonly", "true");
        }
        if (contact.birthday.length > 0) {
            const divRow: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
            const divCol1: HTMLDivElement = Controls.createDiv(divRow, "col-1 mt-2");
            Controls.createElement(divCol1, "i", "bi bi-cake");
            const divCol2: HTMLDivElement = Controls.createDiv(divRow, "col-11");
            const inputBirthday: HTMLInputElement = Controls.createInput(divCol2, "text", "birthday-id", "form-control-plaintext", contact.birthday);
            inputBirthday.setAttribute("readonly", "true");
        }
        if (contact.note.length > 0) {
            const divRow: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
            const divCol1: HTMLDivElement = Controls.createDiv(divRow, "col-1 mt-2");
            Controls.createElement(divCol1, "i", "bi bi-journal");
            const divCol2: HTMLDivElement = Controls.createDiv(divRow, "col-11");
            const textarea: HTMLTextAreaElement = Controls.createElement(divCol2, "textarea", "form-control-plaintext", contact.note) as HTMLTextAreaElement;
            textarea.style.height = "100px";
            textarea.setAttribute("readonly", "true");
        }
        // render delete confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_CONTACTS"),
            pageContext.locale.translate("INFO_REALLY_DELETE_CONTACT"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDeleteConfirmationAsync(e, pageContext));
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onEditBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_CONTACTS"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const contact: ContactResult | null = pageContext.contact.result;
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const inputName: HTMLInputElement = this.createInput(divRows, pageContext, "LABEL_NAME", "name-id", contact?.name);
        this.createInput(divRows, pageContext, "LABEL_PHONE", "phone-id", contact?.phone);
        this.createInput(divRows, pageContext, "LABEL_ADDRESS", "address-id", contact?.address);
        this.createInput(divRows, pageContext, "LABEL_EMAIL_ADDRESS", "email-id", contact?.email);
        this.createInput(divRows, pageContext, "LABEL_BIRTHDAY", "birthday-id", contact?.birthday);
        this.createTextarea(divRows, pageContext, "LABEL_NOTE", "note-id", "100px", contact?.note);
        inputName.focus();
        const saveButton: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
        saveButton.addEventListener("click", async (e: Event) => await this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_CONTACTS"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => this.onEditBackConfirmation(e, pageContext));
    }

    private createInput(divRows: HTMLDivElement, pageContext: PageContext, label: string, id: string, value?: string): HTMLInputElement {
        const divInput: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divInput, id, "form-label", pageContext.locale.translate(label));
        const input: HTMLInputElement = Controls.createInput(divInput, "text", id, "form-control", value);
        input.setAttribute("autocomplete", "off");
        input.setAttribute("spellcheck", "false");
        input.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
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

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DESKTOP";
        pageContext.contact.result = null;
        await pageContext.renderAsync();
    }

    private async onEditAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.contact.edit = true;
        await pageContext.renderAsync();
    }

    private async onDeleteConfirmationAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        await ContactService.deleteContactAsync(token, userInfo, pageContext.contact.result!.id!);
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.contact.changed) {
            pageContext.contact.changed = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onEditBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        if (!pageContext.contact.changed) {
            pageContext.contact.edit = false;
            if (pageContext.contact.result == null) {
                pageContext.pageType = "DESKTOP";
            }
            await pageContext.renderAsync();
        }
    }

    private onEditBackConfirmation(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.contact.changed = false;
        document.getElementById("backbutton-id")!.click();
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const name: string = (document.getElementById("name-id")! as HTMLInputElement).value;
        const phone: string = (document.getElementById("phone-id")! as HTMLInputElement).value;
        const address: string = (document.getElementById("address-id")! as HTMLInputElement).value;
        const email: string = (document.getElementById("email-id")! as HTMLInputElement).value;
        const birthday: string = (document.getElementById("birthday-id")! as HTMLInputElement).value;
        const note: string = (document.getElementById("note-id")! as HTMLTextAreaElement).value;
        let contact: ContactResult = {
            name: name,
            phone: phone,
            address: address,
            email: email,
            birthday: birthday,
            note: note
        };
        if (pageContext.contact.result != null) {
            contact.id = pageContext.contact.result.id;
            pageContext.contact.result = contact;
        }
        await ContactService.saveContactAsync(token, userInfo, contact);
        pageContext.contact.changed = false;
        document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
        document.getElementById("backbutton-id")!.click();
    }
}
