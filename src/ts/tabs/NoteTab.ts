import { PageContext } from "../PageContext";
import { NoteService } from "../services/NoteService";
import { DesktopTab, NoteResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class NoteTab implements Tab {
    desktopTab: DesktopTab = "NOTES";
    bootstrapIcon: string = "bi-journal";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const notes: NoteResult[] = await NoteService.getNotesAsync(token, userInfo);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("NOTES"));
            notes.sort((a, b) => a.title.localeCompare(b.title));
            if (notes.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.note.filter, (filter: string) => this.filterNoteItemList(pageContext, filter, notes));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
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

    private filterNoteItemList(pageContext: PageContext, filter: string, items: NoteResult[]) {
        pageContext.note.filter = filter;
        const filteredItems: NoteResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.title.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLElement = Controls.createSpan(listGroup, "list-group-item");
            a.setAttribute("role", "button");
            Controls.createSpan(a, `bi ${this.bootstrapIcon}`);
            Controls.createSpan(a, "ms-2", item.title);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "NOTE_DETAIL";
                pageContext.note.result = item;
                await pageContext.renderAsync();
            });
        });
    }
}