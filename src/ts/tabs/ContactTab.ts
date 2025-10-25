import { PageContext } from "../PageContext";
import { ContactService } from "../services/ContactService";
import { ContactResult, ContactsResult, DesktopTab, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class ContactTab implements Tab {
    desktopTab: DesktopTab = "CONTACTS";
    bootstrapIcon: string = "bi-person";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("CONTACTS"));
            contacts.items.sort((a, b) => a.name.localeCompare(b.name));
            if (contacts.items.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.contact.filter, (filter: string) => this.filterContactItemList(pageContext, filter, contacts.items));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterContactItemList(pageContext, pageContext.contact.filter, contacts.items);
            }
            const iAdd: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-plus-circle");
            iAdd.setAttribute("role", "button");
            iAdd.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.contact.edit = true;
                pageContext.contact.result = null;
                pageContext.pageType = "CONTACT_DETAIL";
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterContactItemList(pageContext: PageContext, filter: string, items: ContactResult[]) {
        pageContext.contact.filter = filter;
        const filteredItems: ContactResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.name.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLElement = Controls.createSpan(listGroup, "list-group-item");
            a.setAttribute("role", "button");
            Controls.createSpan(a, `bi ${this.bootstrapIcon}`);
            Controls.createSpan(a, "ms-2", item.name);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "CONTACT_DETAIL";
                pageContext.contact.result = item;
                await pageContext.renderAsync();
            });
        });
    }
}