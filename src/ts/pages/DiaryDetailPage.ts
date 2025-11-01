import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { DiaryService } from "../services/DiaryService";

export class DiaryDetailPage implements Page {

    hideNavBar: boolean | undefined = true;

    pageType: PageType = "DIARY_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        try {
            if (pageContext.diary.edit) {
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
        iBack.addEventListener("click", async (e: Event) => await this.onBackViewAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_DIARY"));
        Controls.createAlert(Controls.createDiv(parent), pageContext.locale.translateError(error));
    }

    async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect all data
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const date: Date = pageContext.diary.getDate();
        const entry: string | null = await DiaryService.getEntryAsync(token, userInfo, date);
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4, "my-2");
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackViewAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_DIARY"));
        const iEdit: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
        iEdit.setAttribute("role", "button");
        iEdit.addEventListener("click", async (e: Event) => await this.onEditViewAsync(e, pageContext));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
        Controls.createHeading(cardBody, 2, "card-title", longDate);
        const cardFooter: HTMLDivElement = Controls.createDiv(card, "card-footer mb-3 d-flex justify-content-between align-items-center");
        const iLeft: HTMLElement = Controls.createElement(cardFooter, "i", "ms-4 bi bi-chevron-left", undefined, "leftbutton-id");
        iLeft.setAttribute("role", "button");
        const dayTexts: string[] = ["TEXT_SUNDAY", "TEXT_MONDAY", "TEXT_TUESDAY", "TEXT_WEDNESDAY", "TEXT_THURSDAY", "TEXT_FRIDAY", "TEXT_SATURDAY"];
        Controls.createDiv(cardFooter, "mb-1 text-center", `${pageContext.locale.translate(dayTexts[date.getDay()])}, ${longDate}`);
        const iRight: HTMLElement = Controls.createElement(cardFooter, "i", "me-4 bi bi-chevron-right", undefined, "rightbutton-id");
        iRight.setAttribute("role", "button");
        iLeft.addEventListener("click", async (e: Event) => await this.onLeftViewAsync(e, pageContext));
        iRight.addEventListener("click", async (e: Event) => await this.onRightViewAsync(e, pageContext));
        const divEntry: HTMLDivElement = Controls.createDiv(cardBody, "card-text");
        const textarea: HTMLTextAreaElement = Controls.createElement(divEntry, "textarea", "form-control-plaintext", entry!) as HTMLTextAreaElement;
        textarea.style.height = "400px";
        textarea.setAttribute("readonly", "true");
        textarea.setAttribute("spellcheck", "false");
        textarea.setAttribute("autocomplete", "off");
    }

    async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect all data
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const date: Date = pageContext.diary.getDate();
        const entry: string | null = await DiaryService.getEntryAsync(token, userInfo, date);
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4, "my-2");
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onBackEditAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_DIARY"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const longDate: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
        Controls.createHeading(cardBody, 2, "card-title", longDate);
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divEntry: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divEntry, "entryi-id", "form-label", pageContext.locale.translate("LABEL_DIARY_ENTRY"));
        const textarea: HTMLTextAreaElement = Controls.createElement(divEntry, "textarea", "form-control", entry != null ? entry : "", "diaryentry-id") as HTMLTextAreaElement;
        textarea.style.height = "400px";
        textarea.setAttribute("spellcheck", "false");
        textarea.setAttribute("autocomplete", "off");
        textarea.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        textarea.focus();
        const saveButton: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
        saveButton.addEventListener("click", async (e: Event) => await this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_DIARY"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => this.onConfirmationBack(e, pageContext));
    }

    private async onBackViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DESKTOP";
        pageContext.diary.day = null;
        await pageContext.renderAsync();
    }

    private async onEditViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.diary.edit = true;
        await pageContext.renderAsync();
    }

    private async onLeftViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.diary.previousDay();
        await pageContext.renderAsync();
    }

    private async onRightViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.diary.nextDay();
        await pageContext.renderAsync();
    }

    private async onBackEditAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        if (!pageContext.diary.changed) {
            pageContext.diary.edit = false;
            await pageContext.renderAsync();
        }
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.updateActivity();
        if (!pageContext.diary.changed) {
            pageContext.diary.changed = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const token: string = pageContext.authenticationClient.getToken()!;
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const date: Date = pageContext.diary.getDate();
        const entry: string = (document.getElementById("diaryentry-id") as HTMLTextAreaElement)!.value;
        await DiaryService.saveEntryAsync(token, userInfo, entry, date);
        pageContext.diary.changed = false;
        document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
        document.getElementById("backbutton-id")!.click();
    }

    private onConfirmationBack(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.diary.changed = false;
        document.getElementById("backbutton-id")!.click();
    }
}