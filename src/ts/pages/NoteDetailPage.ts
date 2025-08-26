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
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const note: NoteResult = await NoteService.getNoteAsync(token, userInfo, pageContext.getNote()!.id);
            const date: Date = new Date(note.lastModifiedUtc);
            const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
            const longTime: string = date.toLocaleTimeString(pageContext.locale.getLanguage(), { timeStyle: "long" });
            const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
            card.style.maxWidth = "600px";
            const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
            Controls.createHeading(cardBody, 2, "card-title mb-3", note.title);
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
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_BACK"), "btn btn-primary");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "DESKTOP";
                pageContext.setNote(null);
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}
