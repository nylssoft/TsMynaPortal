import { Page, PageContext } from "../PageContext";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentOption, AppointmentParticipant, AppointmentResult, PageType, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class AppointmentDetailPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "APPOINTMENT_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            // clone options for editing
            pageContext.appointment.options = [];
            const item: AppointmentResult | null = pageContext.appointment.result;
            if (item != null) {
                for (const opt of item.definition!.options) {
                    const clonedOpt: AppointmentOption = {
                        year: opt.year,
                        month: opt.month,
                        days: [...opt.days]
                    }
                    pageContext.appointment.options.push(clonedOpt);
                }
            }
            if (!pageContext.appointment.edit || pageContext.appointment.result == null) {
                pageContext.appointment.monthAndYear = pageContext.appointment.getMinMonthAndYear();
            }
            if (pageContext.appointment.edit) {
                await this.renderEditAsync(parent, pageContext);
            } else {
                await this.renderViewAsync(parent, pageContext);
            }
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const item: AppointmentResult = pageContext.appointment.result!;
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
        Controls.createHeading(cardBody, 2, "card-title", item.definition!.description!);
        const divRow1: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
        const divCol11: HTMLDivElement = Controls.createDiv(divRow1, "col-1 mt-2");
        Controls.createElement(divCol11, "i", "bi bi-person");
        const divCol12: HTMLDivElement = Controls.createDiv(divRow1, "col-10");
        const participantNames: string = AppointmentService.getParticipantNames(item);
        const inputParticipants: HTMLInputElement = Controls.createInput(divCol12, "text", "login-id", "form-control-plaintext", participantNames);
        inputParticipants.readOnly = true;
        const divRow2: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
        const divCol21: HTMLDivElement = Controls.createDiv(divRow2, "col-1 mt-2");
        Controls.createElement(divCol21, "i", "bi bi-link-45deg");
        const divCol22: HTMLDivElement = Controls.createDiv(divRow2, "col-10");
        const url: string = AppointmentService.buildAppointmentUrl(item);
        const aUrl = Controls.createAnchor(divCol22, url, url);
        aUrl.target = "_blank";
        const divCol23: HTMLDivElement = Controls.createDiv(divRow2, "col-1 mt-2");
        const iconCopy: HTMLElement = Controls.createElement(divCol23, "i", "bi bi-clipboard");
        iconCopy.setAttribute("role", "button");
        iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(url));
        const divRow3: HTMLDivElement = Controls.createDiv(cardBody, "row card-text");
        const divCol31: HTMLDivElement = Controls.createDiv(divRow3, "col-12 mt-4 d-flex justify-content-center");
        const divCalendar: HTMLDivElement = Controls.createDiv(divCol31);
        divCalendar.style.maxWidth = "400px";
        this.renderCalendar(pageContext, divCalendar);
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
        const item: AppointmentResult | null = pageContext.appointment.result;
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
        const inputDescription: HTMLInputElement = Controls.createInput(divDescription, "text", "description-id", "form-control", item?.definition?.description);
        inputDescription.setAttribute("autocomplete", "off");
        inputDescription.setAttribute("spellcheck", "false");
        inputDescription.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        const participantNames: string = AppointmentService.getParticipantNames(item);
        const divParticipants: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divParticipants, "participants-id", "form-label", pageContext.locale.translate("LABEL_PARTICIPANTS"));
        const inputParticipants: HTMLInputElement = Controls.createInput(divParticipants, "text", "participants-id", "form-control", participantNames);
        inputParticipants.setAttribute("autocomplete", "off");
        inputParticipants.setAttribute("spellcheck", "false");
        inputParticipants.addEventListener("input", (e: Event) => this.onInput(e, pageContext));
        const divOptions: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divOptions, "calendar-id", "form-label", pageContext.locale.translate("LABEL_OPTIONS"));
        const divCalendar: HTMLDivElement = Controls.createDiv(divOptions);
        divCalendar.style.maxWidth = "400px";
        this.renderCalendar(pageContext, divCalendar);
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
        Controls.removeAllChildren(parent);
        const heading: HTMLHeadingElement = Controls.createHeading(parent, 5, "d-flex justify-content-between align-items-center");
        const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-chevron-left");
        if (pageContext.appointment.hasPreviousMonth()) {
            iLeft.setAttribute("role", "button");
            iLeft.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.previousMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iLeft.classList.add("opacity-25");
        }
        const date: Date = pageContext.appointment.getDate()
        const datestr: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { year: "numeric", month: "long" });
        Controls.createSpan(heading, "mx-auto", datestr);
        const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-chevron-right")
        if (pageContext.appointment.hasNextMonth()) {
            iRight.setAttribute("role", "button");
            iRight.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.nextMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iRight.classList.add("opacity-25");
        }
        const firstDay: number = pageContext.appointment.getFirstDayInMonth();
        const daysInMonth: number = pageContext.appointment.getDaysInMonth();
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
        const optionDays: number[] = pageContext.appointment.getOptionDays();
        for (let i: number = 0; i < 6; i++) {
            const tr: HTMLTableRowElement = Controls.createElement(tbody, "tr") as HTMLTableRowElement;
            for (let j: number = 0; j < 7; j++) {
                if (i === 0 && j < firstDay || day > daysInMonth) {
                    Controls.createElement(tr, "td", "text-center", "\u00A0");
                } else {
                    const td: HTMLTableCellElement = Controls.createElement(tr, "td", "text-center", `${day}`) as HTMLTableCellElement;
                    if (pageContext.appointment.isBeforeToday(now, day)) {
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
                        td.addEventListener("click", (e: MouseEvent) => {
                            pageContext.appointment.toggleOption(constDay);
                            if (!pageContext.appointment.changed) {
                                pageContext.appointment.changed = true;
                                document.getElementById("backbutton-id")!.setAttribute("data-bs-toggle", "modal");
                            }
                            this.renderCalendar(pageContext, parent);
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
        const token: string = pageContext.authenticationClient.getToken()!;
        await AppointmentService.deleteAppointmentAsync(token, pageContext.appointment.result!.uuid);
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
        try {
            const description: string = (document.getElementById("description-id") as HTMLInputElement).value.trim();
            if (description.length == 0) {
                throw new Error("ERROR_DESCRIPTION_MISSING");
            }
            const participantText: string = (document.getElementById("participants-id") as HTMLInputElement).value.trim();
            const participants: AppointmentParticipant[] = this.buildParticipants(participantText, pageContext);
            const appointment: AppointmentResult | null = pageContext.appointment.result;
            if (participants.length == 0) {
                throw new Error("ERROR_PARTICIPANTS_MISSING");
            }
            const options = pageContext.appointment.options.filter(opt => opt.days.length > 0);
            if (options.length == 0) {
                throw new Error("ERROR_OPTIONS_MISSING");
            }
            const hasVotesWithAcceptedDays: boolean = appointment != null && appointment.votes!.some(v => v.accepted.some(opt => opt.days.length > 0));
            if (hasVotesWithAcceptedDays) {
                const participantNames: string[] = participants.map(p => p.username);
                const currentParticipants: string[] = appointment!.definition!.participants.map(p => p.username);
                if (!currentParticipants.every(name => participantNames.includes(name))) {
                    throw new Error("ERROR_CANNOT_REMOVE_PARTICIPANT_AS_VOTES_ALREADY_EXIST");
                }
            }
            const token: string = pageContext.authenticationClient.getToken()!;
            if (appointment != null) {
                await AppointmentService.updateAppointmentAsync(token, appointment.accessToken!, appointment.uuid, description, participants, options);
                const updated: AppointmentResult = await AppointmentService.getAppointmentAsync(appointment.accessToken!, appointment.uuid);
                appointment.definition!.description = updated.definition!.description;
                appointment.definition!.participants = updated.definition!.participants;
                appointment.definition!.options = updated.definition!.options;
            } else {
                const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
                await AppointmentService.createAppointmentAsync(token, user, description, participants, options);
            }
            pageContext.appointment.changed = false;
            document.getElementById("backbutton-id")!.removeAttribute("data-bs-toggle");
            document.getElementById("backbutton-id")!.click();
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private buildParticipants(participants: string, pageContext: PageContext): AppointmentParticipant[] {
        const arr: string[] = participants.replaceAll(",", " ").replaceAll(";", " ").split(" ");
        const nameSet: Set<string> = new Set<string>();
        arr.forEach(elem => {
            const str = elem.trim();
            if (str.length > 0) {
                nameSet.add(str);
            }
        });
        const newParticipants: AppointmentParticipant[] = [];
        nameSet.forEach(name => {
            let userUuid: string | null = AppointmentService.getUserUuid(pageContext.appointment.result, name);
            if (userUuid == null) {
                userUuid = crypto.randomUUID();
            }
            newParticipants.push({
                "username": name,
                "userUuid": userUuid
            });
        });
        newParticipants.sort((p1, p2) => p1.username.localeCompare(p2.username));
        return newParticipants;
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