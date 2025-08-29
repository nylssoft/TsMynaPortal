import { Controls } from "../utils/Controls";
import { NoteService } from "../services/NoteService";
import { PageContext, Page } from "../PageContext";
import { NoteResult, PageType, UserInfoResult } from "../TypeDefinitions";

/**
 * Page implementation for the Note Detail page.
 * It displays detailed information about a specific note, including title, content, and last modified date.
 * It also provides a back button to return to the Desktop page.
 */
export class NoteDetailPage implements Page {

    hideNavBar?: boolean | undefined = true;

    pageType: PageType = "NOTE_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        if (pageContext.note.edit) {
            await this.renderEditAsync(parent, pageContext);
        } else {
            await this.renderViewAsync(parent, pageContext);
        }
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const note: NoteResult = await NoteService.getNoteAsync(token, userInfo, pageContext.note.result!.id!);
            const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
            card.style.maxWidth = "600px";
            const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
            const date: Date = new Date(note.lastModifiedUtc!);
            const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
            const longTime: string = date.toLocaleTimeString(pageContext.locale.getLanguage(), { timeStyle: "long" });
            const heading: HTMLHeadingElement = Controls.createHeading(cardBody, 2, "card-title mb-3", note.title!);
            const iEdit: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
            iEdit.setAttribute("role", "button");
            iEdit.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.note.edit = true;
                await pageContext.renderAsync();
            });
            const iDelete: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-trash", undefined, "deletebutton-id");
            iDelete.setAttribute("role", "button");
            iDelete.setAttribute("data-bs-target", "#confirmationdialog-id");
            iDelete.setAttribute("data-bs-toggle", "modal");
            const cardTextDate: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextDate, "bi bi-calendar");
            Controls.createSpan(cardTextDate, "ms-2", `${longDate} ${longTime}`);
            if (note.content!.length > 0) {
                const divFormFloating: HTMLDivElement = Controls.createDiv(cardBody, "form-floating mb-4");
                const textarea: HTMLTextAreaElement = Controls.createElement(divFormFloating, "textarea", "form-control", note.content!) as HTMLTextAreaElement;
                textarea.style.height = "400px";
                textarea.setAttribute("readonly", "true");
                textarea.setAttribute("spellcheck", "false");
                textarea.setAttribute("autocomplete", "off");
            }
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_BACK"), "btn btn-primary", "backbutton-id");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "DESKTOP";
                pageContext.note.result = null;
                await pageContext.renderAsync();
            });
            Controls.createConfirmationDialog(
                card,
                pageContext.locale.translate("HEADER_NOTES"),
                pageContext.locale.translate("INFO_REALLY_DELETE_NOTE"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"));
            document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => {
                e.preventDefault();
                await NoteService.deleteNoteAsync(token, note.id!);
                document.getElementById("backbutton-id")!.click();
            });            
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        let note: NoteResult | null = null;
        if (pageContext.note.result != null) {
            note  = await NoteService.getNoteAsync(token, userInfo, pageContext.note.result.id!);
        }
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "600px";
        const alertDiv: HTMLDivElement = Controls.createDiv(card);
        const formElement: HTMLFormElement = Controls.createForm(card, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divTitle: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divTitle, "title-id", "form-label", pageContext.locale.translate("LABEL_TITLE"));
        const inputTitle: HTMLInputElement = Controls.createInput(divTitle, "text", "title-id", "form-control");
        inputTitle.value = note != null ? note.title : "";
        inputTitle.setAttribute("autocomplete", "off");
        inputTitle.setAttribute("spellcheck", "false");
        inputTitle.focus();
        inputTitle.addEventListener("input", (e: Event) => {
            e.preventDefault();
            if (!pageContext.note.changed) {
                pageContext.note.changed = true;
                document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
            }
        });
        const divNote: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divNote, "note-id", "form-label", pageContext.locale.translate("LABEL_NOTE"));
        const textarea: HTMLTextAreaElement = Controls.createElement(divNote, "textarea", "form-control", note != null ? note.content! : "") as HTMLTextAreaElement;
        textarea.style.height = "400px";
        textarea.setAttribute("spellcheck", "false");
        textarea.setAttribute("autocomplete", "off");
        textarea.addEventListener("input", (e: Event) => {
            e.preventDefault();
            if (!pageContext.note.changed) {
                pageContext.note.changed = true;
                document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
            }
        });
        const buttonDiv: HTMLDivElement = Controls.createDiv(divRows);
        const saveButton: HTMLButtonElement = Controls.createButton(buttonDiv, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
        saveButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            try {
                await NoteService.saveNoteAsync(token, userInfo, inputTitle.value, textarea.value, pageContext.note.result?.id);
                pageContext.note.changed = false;
                document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
                document.getElementById("backbutton-id")!.click();
            }
            catch (error: Error | unknown) {
                Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
            }
        });
        const backButton: HTMLButtonElement = Controls.createButton(buttonDiv, "button", pageContext.locale.translate("BUTTON_CANCEL"), "ms-4 btn btn-primary", "backbutton-id");
        backButton.setAttribute("data-bs-target", "#confirmationdialog-id");
        backButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            if (!pageContext.note.changed) {
                pageContext.note.edit = false;
                if (pageContext.note.result == null) {
                    pageContext.pageType = "DESKTOP";
                }
                await pageContext.renderAsync();
            }
        });
        Controls.createConfirmationDialog(
            card,
            pageContext.locale.translate("HEADER_NOTES"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => {
            e.preventDefault();
            pageContext.note.changed = false;
            document.getElementById("backbutton-id")!.click();
        });
    }
}
