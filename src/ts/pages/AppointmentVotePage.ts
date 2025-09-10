import { Page, PageContext } from "../PageContext";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentBestVote, AppointmentOption, AppointmentResult, AppointmentVote, PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class AppointmentVotePage implements Page {
    pageType: PageType = "APPOINTMENT_VOTE";

    private readonly KEY_MYNAME: string = "makeadate-myname";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        try {
            const appointment: AppointmentResult = await AppointmentService.getAppointmentByVoteIdAsync(pageContext.vote.vid!);
            if (appointment.definition!.participants.length == 0) {
                throw new Error(pageContext.locale.translateWithArgs("INFO_APPOINTMENT_NO_PARTICIPANTS_1", [appointment.definition!.description]));
            }
            if (pageContext.vote.vusername == null) {
                pageContext.vote.vusername = window.localStorage.getItem(this.KEY_MYNAME);
            }
            if (pageContext.vote.vusername != null) {
                const participantNames: string[] = appointment.definition!.participants.map(p => p.username);
                if (!participantNames.includes(pageContext.vote.vusername)) {
                    pageContext.vote.vusername = null;
                }
            }
            this.filterOptionsAndVotes(appointment, pageContext);
            pageContext.vote.result = appointment;
            pageContext.vote.options = appointment.definition!.options;
            pageContext.vote.monthAndYear = pageContext.vote.getMinMonthAndYear();
            if (pageContext.vote.vusername == null) {
                this.renderSelectName(parent, pageContext);
            } else {
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

    private renderSelectName(parent: HTMLElement, pageContext: PageContext) {
        const appointment: AppointmentResult = pageContext.vote.result!;
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_FIND_APPOINTMENT_1", [appointment.definition!.description]));
        Controls.createParagraph(card, "", pageContext.locale.translate("INFO_QUESTION_YOUR_NAME"));
        const listGroup: HTMLDivElement = Controls.createDiv(card, "list-group");
        appointment.definition!.participants.forEach(p => {
            const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
            const radioButton: HTMLInputElement = Controls.createInput(li, "radio", "", "form-check-input me-2 mt-1");
            radioButton.value = p.username;
            radioButton.name = "username";
            if (p.username == pageContext.vote.vusername) {
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
                pageContext.vote.vusername = elem.value;
                window.localStorage.setItem(this.KEY_MYNAME, pageContext.vote.vusername);
                await pageContext.renderAsync();
            }
        });
    }

    private renderVoteAppointment(parent: HTMLElement, pageContext: PageContext) {
        const appointment: AppointmentResult = pageContext.vote.result!;
        const main: HTMLDivElement = Controls.createDiv(parent);
        const card: HTMLDivElement = Controls.createDiv(main);
        card.style.maxWidth = "400px";
        const title: HTMLParagraphElement = Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_HELLO_1", [pageContext.vote.vusername!]));
        const iSwitch: HTMLElement = Controls.createElement(title, "i", "ms-4 bi bi-person", undefined, "switchbutton-id");
        iSwitch.setAttribute("role", "button");
        iSwitch.addEventListener("click", (e: Event) => {
            e.preventDefault();
            Controls.removeAllChildren(main);
            this.renderSelectName(parent, pageContext);
        });
        Controls.createParagraph(card, "", pageContext.locale.translateWithArgs("INFO_QUESTION_TIME_FOR_1", [appointment.definition!.description]));
        const calendarDiv: HTMLDivElement = Controls.createDiv(card);
        this.renderCalendar(pageContext, calendarDiv);
    }

    private renderCalendar(pageContext: PageContext, parent: HTMLElement) {
        const appointment: AppointmentResult = pageContext.vote.result!;
        const option: AppointmentOption = pageContext.vote.getCurrentOption()!;
        const bestVotes: AppointmentBestVote[] = pageContext.vote.getBestVotes();
        const selectableDays: Set<number> = new Set<number>();
        option.days.forEach(d => selectableDays.add(d));
        const acceptedCount: Map<number, number> = new Map<number, number>();
        const myAcceptedDays: Set<number> = new Set<number>();
        const myUserUuid = AppointmentService.getUserUuid(appointment, pageContext.vote.vusername!)!;
        pageContext.vote.initAcceptedDays(myUserUuid, myAcceptedDays, acceptedCount);
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
        let tbody: HTMLElement = Controls.createElement(table, "tbody");
        let day: number = 1;
        const now: Date = new Date();
        const optionDays: number[] = pageContext.vote.getOptionDays();
        for (let i: number = 0; i < 6; i++) {
            const tr: HTMLTableRowElement = Controls.createElement(tbody, "tr") as HTMLTableRowElement;
            for (let j: number = 0; j < 7; j++) {
                const dayConst: number = day;
                const isBestVote: boolean = bestVotes.some(v => v.year == option.year && v.month == option.month && v.day == dayConst);
                if (i === 0 && j < firstDay || day > daysInMonth) {
                    Controls.createElement(tr, "td", "text-center py-2", "\u00A0");
                } else {
                    const td: HTMLTableCellElement = Controls.createElement(tr, "td", "py-2 text-center position-relative", `${day}`) as HTMLTableCellElement;
                    // td.style.minWidth = "30px";
                    if (pageContext.vote.isBeforeToday(now, day) || !optionDays.includes(day)) {
                        td.classList.add("text-secondary");
                        if (pageContext.theme.isLight()) {
                            td.classList.add("opacity-25");
                        }
                    } else {
                        td.setAttribute("role", "button");
                        td.addEventListener("click", async (e: Event) => this.onClickDayAsync(e, parent, pageContext, dayConst));
                    }
                    if (myAcceptedDays.has(day)) {
                        td.classList.add("table-primary");
                    }
                    if (acceptedCount.has(day)) {
                        const badge: HTMLSpanElement = Controls.createSpan(td, "position-absolute top-0 start-100 badge rounded-pill z-1", `${acceptedCount.get(day)}`);
                        badge.setAttribute("style", "font-size: 0.6em; transform: translateX(-90%);");
                        if (isBestVote) {
                            badge.classList.add("text-bg-primary");
                        } else {
                            badge.classList.add("text-bg-secondary");
                        }
                    }
                    day++;
                }
            }
        }
    }

    private filterOptionsAndVotes(appointment: AppointmentResult, pageContext: PageContext) {
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
    }

    private async onClickDayAsync(e: Event, parent: HTMLElement, pageContext: PageContext, day: number): Promise<void> {
        e.preventDefault();
        const appointment: AppointmentResult = pageContext.vote.result!;
        const myUserUuid: string = AppointmentService.getUserUuid(appointment, pageContext.vote.vusername!)!;
        const vote: AppointmentVote = appointment.votes!.find(v => v.userUuid == myUserUuid)!;
        const option: AppointmentOption = pageContext.vote.getCurrentOption()!;
        let acceptedOption: AppointmentOption | undefined = vote.accepted.find(o => o.year == option.year && o.month == option.month);
        if (!acceptedOption) {
            acceptedOption = { "year": option.year, "month": option.month, "days": [] };
            vote.accepted.push(acceptedOption);
            vote.accepted.sort((a, b) => (a.year - b.year) * 1000 + (a.month - b.month));
        }
        if (acceptedOption.days.includes(day)) {
            acceptedOption.days = acceptedOption.days.filter(d => d != day);
        }
        else {
            acceptedOption.days.push(day);
        }
        await AppointmentService.voteAsync(appointment.accessToken!, appointment.uuid, vote);
        this.renderCalendar(pageContext, parent);
    }
}