import { PageContext } from "../PageContext";
import { DesktopTab } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class TabRenderer {
    private readonly tabRegistrations: Tab[] = [];

    registerTab(tab: Tab) {
        this.tabRegistrations.push(tab);
    }

    async renderTabsAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        const tabs: HTMLUListElement = Controls.createElement(parent, "ul", "nav nav-pills") as HTMLUListElement;
        this.tabRegistrations.forEach(tab => {
            const tabElement: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aTab: HTMLAnchorElement = Controls.createAnchor(tabElement, tab.href, "", "nav-link", pageContext.desktop.tab === tab.desktopTab);
            Controls.createSpan(aTab, `bi ${tab.bootstrapIcon}`);
            tabElement.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, tab.desktopTab));
        });
        const tab: Tab | undefined = this.tabRegistrations.find(tab => tab.desktopTab == pageContext.desktop.tab);
        if (tab) {
            await tab.renderAsync(pageContext, parent, alertDiv);
        }
    }

    private async switchTabAsync(e: MouseEvent, pageContext: PageContext, tabName: DesktopTab): Promise<void> {
        e.preventDefault();
        pageContext.desktop.tab = tabName;
        await pageContext.renderAsync();
    }
}