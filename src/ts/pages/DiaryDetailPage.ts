import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { DiaryService } from "../services/DiaryService";

export class DiaryDetailPage implements Page {

    hideNavBar: boolean | undefined = true;

    pageType: PageType = "DIARY_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const date: Date = pageContext.diary.getDate();
            const entry: string | null = await DiaryService.getEntryAsync(token, userInfo, date);
            const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
            card.style.maxWidth = "600px";
            const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
            const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
            const heading: HTMLHeadingElement = Controls.createHeading(cardBody, 2, "card-title mb-3 d-flex justify-content-between align-items-center");
            const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-arrow-left", undefined, "leftbutton-id");
            iLeft.setAttribute("role", "button");
            iLeft.setAttribute("data-bs-target", "#confirmationdialog-id");
            Controls.createSpan(heading, "mx-auto", longDate);
            const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-arrow-right", undefined, "rightbutton-id");
            iRight.setAttribute("role", "button");
            iRight.setAttribute("data-bs-target", "#confirmationdialog-id");
            iLeft.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                if (!pageContext.diary.changed) {
                    pageContext.diary.previousDay();
                    await pageContext.renderAsync();
                }
            });
            iRight.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                if (!pageContext.diary.changed) {
                    pageContext.diary.nextDay();
                    await pageContext.renderAsync();
                }
            });
            const dayTexts: string[] = ["TEXT_SUNDAY", "TEXT_MONDAY", "TEXT_TUESDAY", "TEXT_WEDNESDAY", "TEXT_THURSDAY", "TEXT_FRIDAY", "TEXT_SATURDAY"];
            Controls.createDiv(cardBody, "mb-1 text-center", pageContext.locale.translate(dayTexts[date.getDay()]));
            const divFormFloating: HTMLDivElement = Controls.createDiv(cardBody, "form-floating mb-4");
            const textarea: HTMLTextAreaElement = Controls.createElement(divFormFloating, "textarea", "form-control", entry!) as HTMLTextAreaElement;
            textarea.style.height = "400px";
            textarea.setAttribute("spellcheck", "false");
            textarea.setAttribute("autocomplete", "off");
            textarea.addEventListener("input", (e: Event) => {
                e.preventDefault();
                if (!pageContext.diary.changed) {
                    pageContext.diary.changed = true;
                    document.getElementById("savebutton-id")!.classList.remove("d-none");
                    document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
                    document.getElementById("rightbutton-id")!.setAttribute("data-bs-toggle", "modal");
                    document.getElementById("leftbutton-id")!.setAttribute("data-bs-toggle", "modal");
                }
            });
            const saveButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary d-none me-4", "savebutton-id");
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_BACK"), "btn btn-primary", "backbutton-id");
            backButton.setAttribute("data-bs-target", "#confirmationdialog-id");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                if (!pageContext.diary.changed) {
                    pageContext.pageType = "DESKTOP";
                    pageContext.diary.day = null;
                    await pageContext.renderAsync();
                }
            });
            saveButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.diary.changed = false;
                saveButton.classList.add("d-none");
                document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
                document.getElementById("leftbutton-id")!.removeAttribute("data-bs-toggle");
                document.getElementById("rightbutton-id")!.removeAttribute("data-bs-toggle");
                try {
                    await DiaryService.saveEntryAsync(token, userInfo, textarea.value, date);
                }
                catch (error: Error | unknown) {
                    Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
                }
            });
            const modalDiv: HTMLDivElement = Controls.createConfirmationDialog(
                parent,
                pageContext.locale.translate("HEADER_DIARY"),
                pageContext.locale.translate("CONFIRMATION_SAVE"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"));
            modalDiv.addEventListener("show.bs.modal", (e: any) => pageContext.diary.confirmationTargetId = e.relatedTarget.id);
            document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => {
                e.preventDefault();
                pageContext.diary.changed = false;
                document.getElementById(pageContext.diary.confirmationTargetId)!.click();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}