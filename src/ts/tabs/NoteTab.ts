import { PageContext } from "../PageContext";
import { NoteService } from "../services/NoteService";
import { DesktopTabType, NoteResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class NoteTab implements DesktopTab {
    tabType: DesktopTabType = "NOTES";
    bootstrapIcon: string = "bi-journal";
    titleKey: string = "NOTES";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const notes: NoteResult[] = await NoteService.getNotesAsync(token, userInfo);
            notes.forEach(note => this.modifiedTime(note));
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate(this.titleKey));
            if (notes.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.note.filter, (filter: string) => this.filterNoteItemList(pageContext, filter, notes));
                const buttonClass = "btn btn-link text-body fs-4 p-0 ms-4 align-baseline";
                const sortBy = Controls.createButton(heading, "button", "", buttonClass, "notes-sort-by-id");
                const propertyIcon = Controls.createSpan(sortBy);
                propertyIcon.setAttribute("aria-hidden", "true");
                const sortOrder = Controls.createButton(heading, "button", "", buttonClass, "notes-sort-order-id");
                const orderIcon = Controls.createSpan(sortOrder);
                orderIcon.setAttribute("aria-hidden", "true");
                const updateSortButtons = (): void => {
                    const byName = pageContext.note.sortBy === "name";
                    const ascending = pageContext.note.sortOrder === "ascending";
                    propertyIcon.className = byName ? "bi bi-fonts" : "bi bi-clock-history";
                    orderIcon.className = ascending ? "bi bi-sort-up" : "bi bi-sort-down";
                    sortBy.title = pageContext.locale.translateWithArgs("NOTES_SORT_TOGGLE_BY_1_2", [
                        pageContext.locale.translate(byName ? "NOTES_SORT_NAME" : "NOTES_SORT_MODIFIED"),
                        pageContext.locale.translate(byName ? "NOTES_SORT_MODIFIED" : "NOTES_SORT_NAME")
                    ]);
                    sortOrder.title = pageContext.locale.translateWithArgs("NOTES_SORT_TOGGLE_ORDER_1_2", [
                        pageContext.locale.translate(ascending ? "NOTES_SORT_ASCENDING" : "NOTES_SORT_DESCENDING"),
                        pageContext.locale.translate(ascending ? "NOTES_SORT_DESCENDING" : "NOTES_SORT_ASCENDING")
                    ]);
                    sortBy.setAttribute("aria-label", sortBy.title);
                    sortOrder.setAttribute("aria-label", sortOrder.title);
                };
                updateSortButtons();
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                sortBy.addEventListener("click", () => {
                    pageContext.note.sortBy = pageContext.note.sortBy === "name" ? "modified" : "name";
                    localStorage.setItem("notes-sort-by", pageContext.note.sortBy);
                    updateSortButtons();
                    this.filterNoteItemList(pageContext, pageContext.note.filter, notes);
                });
                sortOrder.addEventListener("click", () => {
                    pageContext.note.sortOrder = pageContext.note.sortOrder === "ascending" ? "descending" : "ascending";
                    localStorage.setItem("notes-sort-order", pageContext.note.sortOrder);
                    updateSortButtons();
                    this.filterNoteItemList(pageContext, pageContext.note.filter, notes);
                });
                this.filterNoteItemList(pageContext, pageContext.note.filter, notes);
            }
            const iAdd: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-plus-circle");
            iAdd.setAttribute("role", "button");
            iAdd.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.note.edit = true;
                pageContext.pageType = "NOTE_DETAIL";
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private modifiedTime(note: NoteResult): number {
        if (typeof note.lastModifiedUtc !== "string") throw new Error("ERROR_NOTES_DATE_RESPONSE");
        const timestamp = Date.parse(note.lastModifiedUtc);
        if (!Number.isFinite(timestamp)) throw new Error("ERROR_NOTES_DATE_RESPONSE");
        return timestamp;
    }

    private filterNoteItemList(pageContext: PageContext, filter: string, items: NoteResult[]) {
        pageContext.note.filter = filter;
        const filteredItems = items.filter(item => filter.length === 0 || item.title.toLocaleLowerCase().includes(filter));
        const direction = pageContext.note.sortOrder === "ascending" ? 1 : -1;
        const sortByDate = pageContext.note.sortBy === "modified";
        filteredItems.sort((a, b) => {
            const primary = sortByDate ? this.modifiedTime(a) - this.modifiedTime(b) : a.title.localeCompare(b.title, pageContext.locale.getLanguage());
            return direction * primary || a.title.localeCompare(b.title, pageContext.locale.getLanguage()) || (a.id ?? 0) - (b.id ?? 0);
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLElement = Controls.createSpan(listGroup, "list-group-item");
            a.setAttribute("role", "button");
            Controls.createSpan(a, `bi ${this.bootstrapIcon}`);
            Controls.createSpan(a, "ms-2", item.title);
            const modified = this.modifiedTime(item);
            const formatted = new Date(modified).toLocaleString(pageContext.locale.getLanguage(), { dateStyle: "medium", timeStyle: "short" });
            Controls.createElement(a, "small", "d-block text-body-secondary ms-4", pageContext.locale.translateWithArgs("NOTES_MODIFIED_1", [formatted]));
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "NOTE_DETAIL";
                pageContext.note.result = item;
                await pageContext.renderAsync();
            });
        });
    }
}