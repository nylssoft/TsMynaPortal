import { Page, PageContext } from "../PageContext";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentResult, MonthAndYear, PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class AppointmentDetailPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "APPOINTMENT_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        try {
            if (pageContext.appointment.edit) {
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
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_APPOINTMENTS"));
        Controls.createAlert(Controls.createDiv(parent), pageContext.locale.translateError(error));
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect all data
        const appointment: AppointmentResult = pageContext.appointment.result!;
        if (pageContext.appointment.monthAndYear == null) {
            pageContext.appointment.monthAndYear = AppointmentService.getMinMonthAndYear(appointment);
        }
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackViewAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_APPOINTMENTS"));
        const iEdit: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-pencil-square", undefined, "editbutton-id");
        iEdit.setAttribute("role", "button");
        iEdit.addEventListener("click", async (e: Event) => await this.onEditViewAsync(e, pageContext));
        const iDelete: HTMLElement = Controls.createElement(headingActions, "i", "ms-4 bi bi-trash", undefined, "deletebutton-id");
        iDelete.setAttribute("role", "button");
        iDelete.setAttribute("data-bs-target", "#confirmationdialog-id");
        iDelete.setAttribute("data-bs-toggle", "modal");
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const copyAlert: HTMLDivElement = Controls.createDiv(parent, "mt-5 text-center alert alert-success fade")
        copyAlert.style.maxWidth = "600px";
        copyAlert.id = "copy-alert-id";
        copyAlert.setAttribute("role", "alert");
        Controls.createDiv(copyAlert, "", pageContext.locale.translate("COPIED_TO_CLIPBOARD"));
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        Controls.createHeading(cardBody, 2, "card-title", appointment.definition!.description!);
        const divRow1: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
        const divCol11: HTMLDivElement = Controls.createDiv(divRow1, "col-1 mt-2");
        Controls.createElement(divCol11, "i", "bi bi-person");
        const divCol12: HTMLDivElement = Controls.createDiv(divRow1, "col-10");
        const participantNames: string = AppointmentService.getParticipantNames(appointment);
        const inputParticipants: HTMLInputElement = Controls.createInput(divCol12, "text", "login-id", "form-control-plaintext", participantNames);
        inputParticipants.readOnly = true;
        const divRow2: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
        const divCol21: HTMLDivElement = Controls.createDiv(divRow2, "col-1 mt-2");
        Controls.createElement(divCol21, "i", "bi bi-link-45deg");
        const divCol22: HTMLDivElement = Controls.createDiv(divRow2, "col-10");
        const url: string = AppointmentService.buildAppointmentUrl(appointment);
        const textarea: HTMLTextAreaElement = Controls.createElement(divCol22, "textarea", "form-control-plaintext", url) as HTMLTextAreaElement;
        textarea.style.height = "200px";
        textarea.readOnly = true;
        const divCol23: HTMLDivElement = Controls.createDiv(divRow2, "col-1 mt-2");
        const iconCopy: HTMLElement = Controls.createElement(divCol23, "i", "bi bi-clipboard");
        iconCopy.setAttribute("role", "button");
        iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(url));
        const calendarDiv: HTMLDivElement = Controls.createDiv(cardBody, "mt-1", undefined, "calendar-div-id");
        calendarDiv.style.maxWidth = "400px";
        this.renderCalendar(pageContext, calendarDiv);

        // render delete confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_APPOINTMENTS"),
            pageContext.locale.translate("INFO_REALLY_DELETE_APPOINTMENT"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDeleteViewAsync(e, pageContext));
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // collect all data
        const appointment: AppointmentResult | null = pageContext.appointment.result;
        if (pageContext.appointment.monthAndYear == null) {
            pageContext.appointment.monthAndYear = AppointmentService.getMinMonthAndYear(appointment);
        }
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.setAttribute("data-bs-target", "#confirmationdialog-id");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_APPOINTMENTS"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-1 shadow-sm");
        card.style.maxWidth = "600px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const formElement: HTMLFormElement = Controls.createForm(cardBody, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row align-items-center");
        const divDescription: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divDescription, "description-id", "form-label", pageContext.locale.translate("LABEL_DESCRIPTION"));
        const inputDescription: HTMLInputElement = Controls.createInput(divDescription, "text", "description-id", "form-control", appointment?.definition?.description);
        inputDescription.setAttribute("autocomplete", "off");
        inputDescription.setAttribute("spellcheck", "false");
        inputDescription.focus();
        inputDescription.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        const participantNames: string = AppointmentService.getParticipantNames(appointment);
        const divParticipants: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divParticipants, "description-id", "form-label", pageContext.locale.translate("LABEL_PARTICIPANTS"));
        const inputParticipants: HTMLInputElement = Controls.createInput(divParticipants, "text", "description-id", "form-control", participantNames);
        inputParticipants.setAttribute("autocomplete", "off");
        inputParticipants.setAttribute("spellcheck", "false");
        inputParticipants.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        const saveButton: HTMLButtonElement = Controls.createButton(divRows, "submit", pageContext.locale.translate("BUTTON_SAVE"), "btn btn-primary", "savebutton-id");
        saveButton.addEventListener("click", async (e: Event) => await this.onSaveAsync(e, pageContext));
        // render back confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("HEADER_APPOINTMENTS"),
            pageContext.locale.translate("CONFIRMATION_SAVE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", (e: Event) => this.onBackEdit(e, pageContext));
    }

    private renderCalendar(pageContext: PageContext, parent: HTMLElement) {
        const appointment: AppointmentResult | null = pageContext.appointment.result;
        const monthAndYear: MonthAndYear = pageContext.appointment.monthAndYear!;
        Controls.removeAllChildren(parent);
        const heading: HTMLHeadingElement = Controls.createHeading(parent, 5, "d-flex justify-content-between align-items-center");
        const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-chevron-left");
        if (AppointmentService.hasPreviousMonth(monthAndYear, appointment)) {
            iLeft.setAttribute("role", "button");
            iLeft.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.previousMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iLeft.classList.add("opacity-25");
        }
        const date: Date = AppointmentService.getDate(pageContext.appointment.monthAndYear!, 1)
        const datestr: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { year: "numeric", month: "long" });
        Controls.createSpan(heading, "mx-auto", datestr);
        const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-chevron-right")
        if (AppointmentService.hasNextMonth(monthAndYear, appointment)) {
            iRight.setAttribute("role", "button");
            iRight.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.nextMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iRight.classList.add("opacity-25");
        }
        const firstDay: number = AppointmentService.getFirstDayInMonth(pageContext.appointment.monthAndYear!);
        const daysInMonth: number = AppointmentService.getDaysInMonth(pageContext.appointment.monthAndYear!);
        const table: HTMLTableElement = Controls.createElement(parent, "table", "table") as HTMLTableElement;
        const theader: HTMLTableSectionElement = Controls.createElement(table, "thead") as HTMLTableSectionElement;
        const trhead: HTMLTableRowElement = Controls.createElement(theader, "tr") as HTMLTableRowElement;
        const headColumns: { label: string, title: string }[] = [
            { label: "COLUMN_MON", title: "TEXT_MONDAY" },
            { label: "COLUMN_TUE", title: "TEXT_TUESDAY" },
            { label: "COLUMN_WED", title: "TEXT_WEDNESDAY" },
            { label: "COLUMN_THU", title: "TEXT_THURSDAY" },
            { label: "COLUMN_FRI", title: "TEXT_FRIDAY" },
            { label: "COLUMN_SAT", title: "TEXT_SATURDAY" },
            { label: "COLUMN_SON", title: "TEXT_SUNDAY" }
        ];
        headColumns.forEach(val => {
            const th: HTMLTableCellElement = Controls.createElement(trhead, "th", "text-center", pageContext.locale.translate(val.label)) as HTMLTableCellElement;
            th.title = pageContext.locale.translate(val.title);
        });
        let tbody = Controls.createElement(table, "tbody");
        let day: number = 1;
        const now: Date = new Date();
        const optionDays: number[] = AppointmentService.getOptionDays(pageContext.appointment.monthAndYear!, pageContext.appointment.result);
        for (let i: number = 0; i < 6; i++) {
            const tr: HTMLTableRowElement = Controls.createElement(tbody, "tr") as HTMLTableRowElement;
            for (let j: number = 0; j < 7; j++) {
                if (i === 0 && j < firstDay || day > daysInMonth) {
                    Controls.createElement(tr, "td", "text-center", "\u00A0");
                } else {
                    const td: HTMLTableCellElement = Controls.createElement(tr, "td", "text-center", `${day}`) as HTMLTableCellElement;
                    if (AppointmentService.isBeforeToday(now, day, pageContext.appointment.monthAndYear!)) {
                        td.classList.add("text-secondary");
                        if (pageContext.theme.isLight()) {
                            td.classList.add("opacity-25");
                        }
                    }
                    if (optionDays.includes(day)) {
                        td.classList.add("table-active");
                    }
                    if (pageContext.appointment.edit) {
                        td.setAttribute("role", "button");
                        const constDay: number = day; // bind to const for the following capture
                        td.addEventListener("click", async (e: MouseEvent) => {
                            e.preventDefault();
                        });
                    }
                    day++;
                }
            }
        }
    }

    private async onBackViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DESKTOP";
        pageContext.appointment.result = null;
        await pageContext.renderAsync();
    }

    private async onEditViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.appointment.edit = true;
        await pageContext.renderAsync();
    }

    private async onDeleteViewAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        console.log("TODO: delete appointment");
        document.getElementById("backbutton-id")!.click();
    }

    private onInput(e: Event, pageContext: PageContext) {
        e.preventDefault();
        if (!pageContext.appointment.changed) {
            pageContext.appointment.changed = true;
            document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
        }
    }

    private async onSaveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const description: string = (document.getElementById("description-id") as HTMLInputElement).value;
        console.log(description);
        console.log("TODO: save appointment");
        pageContext.appointment.changed = false;
        document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
        document.getElementById("backbutton-id")!.click();
    }

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        if (!pageContext.appointment.changed) {
            pageContext.appointment.edit = false;
            if (pageContext.appointment.result == null) {
                pageContext.pageType = "DESKTOP";
            }
            await pageContext.renderAsync();
        }
    }

    private onBackEdit(e: Event, pageContext: PageContext) {
        e.preventDefault();
        pageContext.appointment.changed = false;
        document.getElementById("backbutton-id")!.click();
    }

    private async copyToClipboardAsync(text: string): Promise<void> {
        await navigator.clipboard.writeText(text);
        document.getElementById("copy-alert-id")?.classList.add("show");
        window.setTimeout(() => document.getElementById("copy-alert-id")?.classList.remove("show"), 1000);
    }
}