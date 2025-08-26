import { ContactService } from "../services/ContactService";
import { Controls } from "../utils/Controls";
import { NoteService } from "../services/NoteService";
import { PageContext, Page } from "../PageContext";
import { PasswordManagerService } from "../services/PasswordManagerService";
import { ContactResult, ContactsResult, DesktopTab, NoteResult, PageType, PasswordItemResult, UserInfoResult } from "../TypeDefinitions";
import { DiaryService } from "../services/DiaryService";

/**
 * Page implementation for the Desktop page.
 */
export class DesktopPage implements Page {

    pageType: PageType = "DESKTOP";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            if (!pageContext.isWelcomeClosed()) {
                await this.renderWelcomeMessageAsync(parent, pageContext);
            }
            const tabs: HTMLUListElement = Controls.createElement(parent, "ul", "nav nav-pills") as HTMLUListElement;
            const tabBirthdays: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aBirthdays: HTMLAnchorElement = Controls.createAnchor(tabBirthdays, "birthdays", "", "nav-link", pageContext.getDesktopTab() === "BIRTHDAYS");
            Controls.createSpan(aBirthdays, "bi bi-cake");
            aBirthdays.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "BIRTHDAYS"));
            const tabContacts: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aContacts: HTMLAnchorElement = Controls.createAnchor(tabContacts, "contacts", "", "nav-link", pageContext.getDesktopTab() === "CONTACTS");
            Controls.createSpan(aContacts, "bi bi-person");
            aContacts.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "CONTACTS"));
            const tabNotes: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aNotes: HTMLAnchorElement = Controls.createAnchor(tabNotes, "notes", "", "nav-link", pageContext.getDesktopTab() === "NOTES");
            Controls.createSpan(aNotes, "bi bi-journal");
            aNotes.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "NOTES"));
            const tabPasswordManager: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aPasswordManager: HTMLAnchorElement = Controls.createAnchor(tabPasswordManager, "passwordmanager", "", "nav-link", pageContext.getDesktopTab() === "PASSWORD_MANAGER");
            Controls.createSpan(aPasswordManager, "bi bi-lock");
            aPasswordManager.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "PASSWORD_MANAGER"));
            const tabDiary: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aDiary: HTMLAnchorElement = Controls.createAnchor(tabDiary, "diary", "", "nav-link", pageContext.getDesktopTab() === "DIARY");
            Controls.createSpan(aDiary, "bi bi-calendar");
            aDiary.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "DIARY"));
            if (pageContext.getDesktopTab() === "BIRTHDAYS") {
                await this.renderBirthdaysAsync(pageContext, parent, alertDiv);
            } else if (pageContext.getDesktopTab() === "CONTACTS") {
                await this.renderContactsAsync(pageContext, parent, alertDiv);
            } else if (pageContext.getDesktopTab() === "NOTES") {
                await this.renderNotesAsync(pageContext, parent, alertDiv);
            } else if (pageContext.getDesktopTab() === "PASSWORD_MANAGER") {
                await this.renderPasswordManagerAsync(pageContext, parent, alertDiv);
            } else if (pageContext.getDesktopTab() === "DIARY") {
                await this.renderDiaryAsync(pageContext, parent, alertDiv);
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private async switchTabAsync(e: MouseEvent, pageContext: PageContext, tabName: DesktopTab): Promise<void> {
        e.preventDefault();
        pageContext.setDesktopTab(tabName);
        await pageContext.renderAsync();
    }

    private async renderWelcomeMessageAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        const lastLoginDate: Date | null = await pageContext.authenticationClient.getLastLoginDateAsync();
        const now: Date = new Date();
        const longDate: string = now.toLocaleDateString(pageContext.locale.getLanguage(), { dateStyle: "long" });
        const longTime: string = now.toLocaleTimeString(pageContext.locale.getLanguage(), { timeStyle: "long" });
        const welcomeElem: HTMLDivElement = Controls.createDiv(parent, "alert alert-success alert-dismissible");
        welcomeElem.setAttribute("role", "alert");
        Controls.createDiv(welcomeElem, "", pageContext.locale.translateWithArgs("MESSAGE_WELCOME_1_2_3", [userInfo.name, longDate, longTime]));
        const welcomeCloseButton: HTMLButtonElement = Controls.createButton(welcomeElem, "button", "", "btn-close");
        welcomeCloseButton.setAttribute("data-bs-dismiss", "alert");
        welcomeCloseButton.setAttribute("aria-label", "Close");
        if (lastLoginDate != null) {
            const lastLoginStr: string = lastLoginDate.toLocaleString(pageContext.locale.getLanguage(), { dateStyle: "long", timeStyle: "long" });
            Controls.createDiv(welcomeElem, "mt-2", pageContext.locale.translateWithArgs("MESSAGE_LAST_LOGIN_1", [lastLoginStr]));
        }
        welcomeElem.addEventListener('closed.bs.alert', _ => pageContext.setWelcomeClosed(true));
    }

    // birthday tab

    private async renderBirthdaysAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("BIRTHDAYS"));
            const birthdays: ContactResult[] = [];
            contacts.items.forEach((contact) => {
                contact.daysUntilBirthday = ContactService.getDaysUntilBirthday(contact);
                if (contact.daysUntilBirthday != null && contact.daysUntilBirthday <= 31) {
                    birthdays.push(contact);
                }
            });
            if (birthdays.length > 0) {
                birthdays.sort((a, b) => a.daysUntilBirthday! - b.daysUntilBirthday!);
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                birthdays.forEach(contact => {
                    const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "contactdetails", "", "list-group-item");
                    Controls.createSpan(a, "bi bi-person");
                    Controls.createSpan(a, "ms-2", contact.name);
                    Controls.createSpan(a, "ms-2 bi bi-cake");
                    if (contact.daysUntilBirthday == 0) {
                        Controls.createSpan(a, "ms-2", pageContext.locale.translate("TODAY"));
                    } else if (contact.daysUntilBirthday == 1) {
                        Controls.createSpan(a, "ms-2", pageContext.locale.translate("TOMORROW"));
                    } else {
                        Controls.createSpan(a, "ms-2", `${contact.daysUntilBirthday} ${pageContext.locale.translate("DAYS")}`);
                    }
                    a.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.pageType = "CONTACT_DETAIL";
                        pageContext.setContact(contact);
                        await pageContext.renderAsync();
                    });
                });
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    // contacts tab

    private async renderContactsAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("CONTACTS"));
            contacts.items.sort((a, b) => a.name.localeCompare(b.name));
            if (contacts.items.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.getContactsFilter(), (filter: string) => this.filterContactItemList(pageContext, filter, contacts.items));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterContactItemList(pageContext, pageContext.getContactsFilter(), contacts.items);
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterContactItemList(pageContext: PageContext, filter: string, items: ContactResult[]) {
        pageContext.setContactsFilter(filter);
        const filteredItems: ContactResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.name.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "contactdetails", "", "list-group-item");
            Controls.createSpan(a, "bi bi-person");
            Controls.createSpan(a, "ms-2", item.name);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "CONTACT_DETAIL";
                pageContext.setContact(item);
                await pageContext.renderAsync();
            });
        });
    }

    // notes tab

    private async renderNotesAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const notes: NoteResult[] = await NoteService.getNotesAsync(token, userInfo);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("NOTES"));
            notes.sort((a, b) => a.title.localeCompare(b.title));
            if (notes.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.getNoteFilter(), (filter: string) => this.filterNoteItemList(pageContext, filter, notes));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterNoteItemList(pageContext, pageContext.getNoteFilter(), notes);
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterNoteItemList(pageContext: PageContext, filter: string, items: NoteResult[]) {
        pageContext.setNoteFilter(filter);
        const filteredItems: NoteResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.title.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "notedetails", "", "list-group-item");
            Controls.createSpan(a, "bi bi-journal");
            Controls.createSpan(a, "ms-2", item.title);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "NOTE_DETAIL";
                pageContext.setNote(item);
                await pageContext.renderAsync();
            });
        });
    }

    // passwords tab

    private async renderPasswordManagerAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const passwordItems: PasswordItemResult[] = userInfo.hasPasswordManagerFile ? await PasswordManagerService.getPasswordFileAsync(token, userInfo) : [];
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("PASSWORD_MANAGER"));
            passwordItems.sort((a, b) => a.Name.localeCompare(b.Name));
            if (passwordItems.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.getPasswordItemFilter(), (filter: string) => this.filterPasswordItemList(pageContext, filter, passwordItems));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterPasswordItemList(pageContext, pageContext.getPasswordItemFilter(), passwordItems);
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterPasswordItemList(pageContext: PageContext, filter: string, items: PasswordItemResult[]) {
        pageContext.setPasswordItemFilter(filter);
        const filteredItems: PasswordItemResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.Name.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "passworddetails", "", "list-group-item");
            Controls.createSpan(a, "bi bi-lock");
            Controls.createSpan(a, "ms-2", item.Name);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "PASSWORD_ITEM_DETAIL";
                pageContext.setPasswordItem(item);
                await pageContext.renderAsync();
            });
        });
    }

    // diary tab

    private async renderDiaryAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
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
        const iLeft: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-arrow-left");
        iLeft.setAttribute("role", "button");
        Controls.createSpan(heading, "mx-auto", datestr);
        const iRight: HTMLElement = Controls.createElement(heading, "i", "me-4 bi bi-arrow-right")
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
                        pageContext.diary.confirmationTargetId = "";
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