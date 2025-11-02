import { PageContext } from "../PageContext";
import { DesktopTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class DesktopTabRenderer {
    private readonly tabRegistrations: DesktopTab[] = [];

    registerTab(tab: DesktopTab) {
        this.tabRegistrations.push(tab);
    }

    async renderTabsAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        const currentTabType: DesktopTabType = pageContext.desktop.getLastUsedTabType();
        const tabs: HTMLUListElement = Controls.createElement(parent, "ul", "nav nav-pills") as HTMLUListElement;
        this.tabRegistrations.forEach(tab => {
            const tabElement: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aTab: HTMLAnchorElement = Controls.createAnchor(tabElement, `?tab=${tab.tabType}`, "", "nav-link", currentTabType === tab.tabType);
            Controls.createSpan(aTab, `bi ${tab.bootstrapIcon}`);
            tabElement.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, tab.tabType));
        });
        const tab: DesktopTab | undefined = this.tabRegistrations.find(tab => tab.tabType == currentTabType);
        if (tab) {
            await tab.renderAsync(pageContext, parent, alertDiv);
        }
    }

    private async switchTabAsync(e: MouseEvent, pageContext: PageContext, tabType: DesktopTabType): Promise<void> {
        e.preventDefault();
        pageContext.desktop.setLastUsedTabType(tabType);
        await pageContext.renderAsync();
    }
}