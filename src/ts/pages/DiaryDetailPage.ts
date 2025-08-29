import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { DiaryService } from "../services/DiaryService";

export class DiaryDetailPage implements Page {

    hideNavBar: boolean | undefined = true;

    pageType: PageType = "DIARY_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        if (pageContext.diary.edit) {
            await this.renderEditAsync(parent, pageContext);
        } else {
            await this.renderViewAsync(parent, pageContext);
        }
    }

    async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const headingActions: HTMLHeadingElement = Controls.createHeading(cardBody, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.pageType = "DESKTOP";
            pageContext.diary.day = null;
            await pageContext.renderAsync();
        });
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const date: Date = pageContext.diary.getDate();
            const entry: string | null = await DiaryService.getEntryAsync(token, userInfo, date);
            const iEdit: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
            iEdit.setAttribute("role", "button");
            iEdit.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.diary.edit = true;
                await pageContext.renderAsync();
            });
            const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
            Controls.createHeading(cardBody, 2, "card-title", longDate);
            const cardFooter: HTMLDivElement = Controls.createDiv(card, "card-footer mb-3 d-flex justify-content-between align-items-center");
            const iLeft: HTMLElement = Controls.createElement(cardFooter, "i", "ms-4 bi bi-chevron-left", undefined, "leftbutton-id");
            iLeft.setAttribute("role", "button");
            const dayTexts: string[] = ["TEXT_SUNDAY", "TEXT_MONDAY", "TEXT_TUESDAY", "TEXT_WEDNESDAY", "TEXT_THURSDAY", "TEXT_FRIDAY", "TEXT_SATURDAY"];
            Controls.createDiv(cardFooter, "mb-1 text-center", `${pageContext.locale.translate(dayTexts[date.getDay()])}, ${longDate}`);
            const iRight: HTMLElement = Controls.createElement(cardFooter, "i", "me-4 bi bi-chevron-right", undefined, "rightbutton-id");
            iRight.setAttribute("role", "button");
            iLeft.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.diary.previousDay();
                await pageContext.renderAsync();
            });
            iRight.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.diary.nextDay();
                await pageContext.renderAsync();
            });
            const divFormFloating: HTMLDivElement = Controls.createDiv(cardBody, "form-floating");
            const textarea: HTMLTextAreaElement = Controls.createElement(divFormFloating, "textarea", "form-control", entry!) as HTMLTextAreaElement;
            textarea.style.height = "400px";
            textarea.setAttribute("readonly", "true");
            textarea.setAttribute("spellcheck", "false");
            textarea.setAttribute("autocomplete", "off");
        }
        catch (error: Error | unknown) {
            Controls.createAlert(Controls.createDiv(cardBody), pageContext.locale.translateError(error));
        }
    }

    async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const headingActions: HTMLHeadingElement = Controls.createHeading(cardBody, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            if (!pageContext.diary.changed) {
                pageContext.diary.edit = false;
                await pageContext.renderAsync();
            }
        });
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const date: Date = pageContext.diary.getDate();
            const entry: string | null = await DiaryService.getEntryAsync(token, userInfo, date);
            const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
            Controls.createHeading(cardBody, 2, "card-title", longDate);
            const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
            const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
            const divEntry: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
            Controls.createLabel(divEntry, "entryi-id", "form-label", pageContext.locale.translate("LABEL_DIARY_ENTRY"));
            const textarea: HTMLTextAreaElement = Controls.createElement(divEntry, "textarea", "form-control", entry != null ? entry : "") as HTMLTextAreaElement;
            textarea.style.height = "400px";
            textarea.setAttribute("spellcheck", "false");
            textarea.setAttribute("autocomplete", "off");
            textarea.addEventListener("input", (e: Event) => {
                e.preventDefault();
                if (!pageContext.diary.changed) {
                    pageContext.diary.changed = true;
                    document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
                }
            });
            textarea.focus();
            const saveButton: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
            saveButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                await DiaryService.saveEntryAsync(token, userInfo, textarea.value, date);
                pageContext.diary.changed = false;
                document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
                document.getElementById("backbutton-id")!.click();
            });
            Controls.createConfirmationDialog(
                parent,
                pageContext.locale.translate("HEADER_DIARY"),
                pageContext.locale.translate("CONFIRMATION_SAVE"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"));
            document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => {
                e.preventDefault();
                pageContext.diary.changed = false;
                document.getElementById("backbutton-id")!.click();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(Controls.createDiv(cardBody), pageContext.locale.translateError(error));
        }
    }
}