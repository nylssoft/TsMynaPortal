import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { SettingsTabRenderer } from "../tabs/SettingsTabRenderer";
import { ViewSettingsTab } from "../tabs/ViewSettingsTab";
import { AccountSettingsTab } from "../tabs/AccountSettingsTab";

export class SettingsPage implements Page {

    pageType: PageType = "SETTINGS";

    private readonly tabRenderer: SettingsTabRenderer = new SettingsTabRenderer();

    constructor() {
        this.tabRenderer.registerTab(new ViewSettingsTab());
        this.tabRenderer.registerTab(new AccountSettingsTab());
    }

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            await this.tabRenderer.renderTabsAsync(pageContext, parent, alertDiv);
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}
