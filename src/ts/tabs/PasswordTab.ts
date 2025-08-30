import { PageContext } from "../PageContext";
import { PasswordManagerService } from "../services/PasswordManagerService";
import { DesktopTab, PasswordItemResult, PasswordItemsResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class PasswordTab implements Tab {
    desktopTab: DesktopTab = "PASSWORD_MANAGER";
    href: string = "passwords";
    bootstrapIcon: string = "bi-lock";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const passwordItems: PasswordItemsResult = await PasswordManagerService.getPasswordFileAsync(token, userInfo);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("PASSWORD_MANAGER"));
            passwordItems.items.sort((a, b) => a.Name.localeCompare(b.Name));
            if (passwordItems.items.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.passwordItem.filter, (filter: string) => this.filterPasswordItemList(pageContext, filter, passwordItems.items));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterPasswordItemList(pageContext, pageContext.passwordItem.filter, passwordItems.items);
            }
            const iAdd: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-plus-circle");
            iAdd.setAttribute("role", "button");
            iAdd.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.passwordItem.edit = true;
                pageContext.pageType = "PASSWORD_ITEM_DETAIL";
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterPasswordItemList(pageContext: PageContext, filter: string, items: PasswordItemResult[]) {
        pageContext.passwordItem.filter = filter;
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
            Controls.createSpan(a, `bi ${this.bootstrapIcon}`);
            Controls.createSpan(a, "ms-2", item.Name);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.pageType = "PASSWORD_ITEM_DETAIL";
                pageContext.passwordItem.result = item;
                await pageContext.renderAsync();
            });
        });
    }
}