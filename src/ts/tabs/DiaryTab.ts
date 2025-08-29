import { PageContext } from "../PageContext";
import { DiaryService } from "../services/DiaryService";
import { DesktopTab } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class DiaryTab implements Tab {
    desktopTab: DesktopTab = "DIARY";
    href: string = "diary";
    bootstrapIcon: string = "bi-calendar";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const date: Date = pageContext.diary.getDate();
            const days: number[] = await DiaryService.getDaysAsync(token, date);
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("DIARY"));
            const datestr: string = date.toLocaleDateString(pageContext.locale.getLanguage(), { year: "numeric", month: "long" });
            const calendarDiv: HTMLDivElement = Controls.createDiv(parent);
            calendarDiv.style.maxWidth = "400px";
            this.renderCalendar(pageContext, calendarDiv, days, datestr);
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private renderCalendar(pageContext: PageContext, parent: HTMLElement, days: number[], datestr: string) {
        Controls.removeAllChildren(parent);
        const heading: HTMLHeadingElement = Controls.createHeading(parent, 5, "d-flex justify-content-between align-items-center");
        const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-chevron-left");
        iLeft.setAttribute("role", "button");
        Controls.createSpan(heading, "mx-auto", datestr);
        const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-chevron-right")
        iRight.setAttribute("role", "button");
        iLeft.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.diary.previousMonth();
            await pageContext.renderAsync();
        });
        iRight.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.diary.nextMonth();
            await pageContext.renderAsync();
        });
        const firstDay: number = pageContext.diary.getFirstDayInMonth();
        const daysInMonth: number = pageContext.diary.getDaysInMonth();
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
        const now: Date = new Date();
        let day: number = 1;
        for (let i: number = 0; i < 6; i++) {
            const tr: HTMLTableRowElement = Controls.createElement(tbody, "tr") as HTMLTableRowElement;
            for (let j: number = 0; j < 7; j++) {
                if (i === 0 && j < firstDay || day > daysInMonth) {
                    Controls.createElement(tr, "td", "text-center", "\u00A0");
                } else {
                    const td: HTMLTableCellElement = Controls.createElement(tr, "td", "text-center", `${day}`) as HTMLTableCellElement;
                    td.setAttribute("role", "button");
                    const constDay: number = day; // bind to const for the following capture
                    td.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.diary.day = constDay;
                        pageContext.diary.changed = false;
                        pageContext.pageType = "DIARY_DETAIL";
                        await pageContext.renderAsync();
                    });
                    if (!days.includes(day)) {
                        td.classList.add("text-secondary");
                        if (pageContext.theme.isLight()) {
                            td.classList.add("opacity-25");
                        }
                    }
                    if (pageContext.diary.isToday(now, day)) {
                        td.classList.add("table-active");
                    }
                    day++;
                }
            }
        }
    }
}