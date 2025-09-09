import { Page, PageContext } from "../PageContext";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentResult, PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class AppointmentVotePage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "APPOINTMENT_VOTE";

    private myName: string | null = null;

    private readonly KEY_MYNAME: string = "makeadate-myname";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        Controls.createHeading(parent, 4, "", pageContext.locale.translate("HEADER_APPOINTMENTS"));
        const params: URLSearchParams = new URLSearchParams(window.location.search);
        try {
            let accessToken: string = "";
            try {
                accessToken = atob(params.get("id")!);
            }
            catch (err) {
                console.error(err);
            }
            const arr: string[] = accessToken.split("#");
            if (arr.length != 3) {
                throw new Error("INFO_APPOINTMENT_INVALID");
            }
            const uuid: string = arr[1];
            const appointment: AppointmentResult = await AppointmentService.getAppointmentAsync(accessToken, uuid);
            if (this.myName == null) {
                this.myName = window.localStorage.getItem(this.KEY_MYNAME);
            }
            if (this.myName != null) {
                const participantNames: string[] = appointment.definition!.participants.map(p => p.username);
                if (!participantNames.includes(this.myName)) {
                    this.myName = null;
                }
            }
            if (appointment.definition!.participants.length == 0) {
                throw new Error(pageContext.locale.translateWithArgs("INFO_APPOINTMENT_NO_PARTICIPANTS_1", [appointment.definition!.description]));
            }
            const now: Date = new Date();
            const year: number = now.getFullYear();
            const month: number = now.getMonth() + 1;
            const day: number = now.getDate();
            appointment.definition!.options = appointment.definition!.options
                .filter(opt => opt.year > year || opt.year == year && opt.month >= month);
            appointment.definition!.options
                .filter(opt => opt.year == year && opt.month == month)
                .forEach(opt => opt.days = opt.days.filter(d => d >= day));
            appointment.votes!.forEach(v => {
                v.accepted = v.accepted.filter(opt => opt.year > year || opt.year == year && opt.month >= month);
                v.accepted
                    .filter(opt => opt.year == year && opt.month == month)
                    .forEach(opt => opt.days = opt.days.filter(d => d >= day));
            });
            if (!appointment.definition!.options.some(opt => opt.days.length > 0)) {
                throw new Error(pageContext.locale.translateWithArgs("INFO_APPOINTMENT_NO_OPTIONS_1", [appointment.definition!.description]));
            }
            if (this.myName == null) {
                this.renderSelectName(parent, pageContext, appointment);
            } else {
                pageContext.vote.result = appointment;
                pageContext.vote.options = appointment.definition!.options;
                pageContext.vote.monthAndYear = pageContext.vote.getMinMonthAndYear();
                this.renderVoteAppointment(parent, pageContext);
            }
        }
        catch (error: Error | unknown) {
            this.renderError(parent, pageContext, error);
        }
    }

    private renderError(parent: HTMLElement, pageContext: PageContext, error: Error | unknown) {
        Controls.createAlert(Controls.createDiv(parent), pageContext.locale.translateError(error));
    }

    private renderSelectName(parent1: HTMLElement, pageContext: PageContext, appointment: AppointmentResult) {
        const card: HTMLDivElement = Controls.createDiv(parent1, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_FIND_APPOINTMENT_1", [appointment.definition!.description]));
        Controls.createParagraph(card, "", pageContext.locale.translate("INFO_QUESTION_YOUR_NAME"));
        const listGroup: HTMLDivElement = Controls.createDiv(card, "list-group");
        appointment.definition!.participants.forEach(p => {
            const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
            const radioButton: HTMLInputElement = Controls.createInput(li, "radio", "", "form-check-input me-2 mt-1");
            radioButton.value = p.username;
            radioButton.name = "username";
            if (this.myName != null && this.myName == p.username) {
                radioButton.checked = true;
            }
            Controls.createSpan(li, `bi bi-person`);
            Controls.createSpan(li, "ms-2 me-auto", p.username);
            li.addEventListener("click", (e: Event) => {
                if (e.target != radioButton) {
                    e.preventDefault();
                    radioButton.checked = true;
                }
            });
        });
        const voteButton: HTMLButtonElement = Controls.createButton(card, "button", pageContext.locale.translate("BUTTON_VOTE"), "btn btn-primary mt-4", "vote-button-id");
        voteButton.addEventListener("click", async (e: Event) => {
            const elem: HTMLInputElement | null = document.querySelector("input[name='username']:checked") as HTMLInputElement;
            if (elem != null) {
                this.myName = elem.value;
                window.localStorage.setItem(this.KEY_MYNAME, this.myName);
                await pageContext.renderAsync();
            }
        });
    }

    private renderVoteAppointment(parent: HTMLElement, pageContext: PageContext) {
        const appointment: AppointmentResult = pageContext.vote.result!;
        const main: HTMLDivElement = Controls.createDiv(parent);
        const card: HTMLDivElement = Controls.createDiv(main, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const title: HTMLParagraphElement = Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_HELLO_1", [this.myName!]));
        const iSwitch: HTMLElement = Controls.createElement(title, "i", "ms-4 bi bi-person", undefined, "switchbutton-id");
        iSwitch.setAttribute("role", "button");
        iSwitch.addEventListener("click", (e: Event) => {
            Controls.removeAllChildren(main);
            this.renderSelectName(parent, pageContext, appointment);
        });
        Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_QUESTION_TIME_FOR_1", [appointment.definition!.description]));
        const calendarDiv: HTMLDivElement = Controls.createDiv(card);
        this.renderCalendar(pageContext, calendarDiv);
    }

    private renderCalendar(pageContext: PageContext, parent: HTMLElement) {
        Controls.removeAllChildren(parent);
        const heading: HTMLHeadingElement = Controls.createHeading(parent, 5, "d-flex justify-content-between align-items-center");
        const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-chevron-left");
        if (pageContext.vote.hasPreviousMonth()) {
            iLeft.setAttribute("role", "button");
            iLeft.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.vote.previousMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iLeft.classList.add("opacity-25");
        }
        const date: Date = pageContext.vote.getDate()
        const datestr: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { year: "numeric", month: "long" });
        Controls.createSpan(heading, "mx-auto", datestr);
        const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-chevron-right")
        if (pageContext.vote.hasNextMonth()) {
            iRight.setAttribute("role", "button");
            iRight.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.vote.nextMonth();
                this.renderCalendar(pageContext, parent);
            });
        } else {
            iRight.classList.add("opacity-25");
        }
        const firstDay: number = pageContext.vote.getFirstDayInMonth();
        const daysInMonth: number = pageContext.vote.getDaysInMonth();
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
        const optionDays: number[] = pageContext.vote.getOptionDays();
        for (let i: number = 0; i < 6; i++) {
            const tr: HTMLTableRowElement = Controls.createElement(tbody, "tr") as HTMLTableRowElement;
            for (let j: number = 0; j < 7; j++) {
                if (i === 0 && j < firstDay || day > daysInMonth) {
                    Controls.createElement(tr, "td", "text-center", "\u00A0");
                } else {
                    const td: HTMLTableCellElement = Controls.createElement(tr, "td", "text-center", `${day}`) as HTMLTableCellElement;
                    if (pageContext.vote.isBeforeToday(now, day) || !optionDays.includes(day)) {
                        td.classList.add("text-secondary");
                        if (pageContext.theme.isLight()) {
                            td.classList.add("opacity-25");
                        }
                    }
                    day++;
                }
            }
        }
    }
}