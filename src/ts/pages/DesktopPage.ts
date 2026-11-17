import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { BirthdayTab } from "../tabs/BirthdayTab";
import { ContactTab } from "../tabs/ContactTab";
import { NoteTab } from "../tabs/NoteTab";
import { PasswordTab } from "../tabs/PasswordTab";
import { DiaryTab } from "../tabs/DiaryTab";
import { DesktopTabRenderer } from "../tabs/DesktopTabRenderer";
import { DocumentTab } from "../tabs/DocumentTab";
import { AppointmentTab } from "../tabs/AppointmentTab";
import { WeatherTab } from "../tabs/WeatherTab";

/**
 * Page implementation for the Desktop page.
 */
export class DesktopPage implements Page {

    pageType: PageType = "DESKTOP";

    private readonly tabRenderer: DesktopTabRenderer = new DesktopTabRenderer();

    constructor() {
        this.tabRenderer.registerTab(new BirthdayTab());
        this.tabRenderer.registerTab(new ContactTab());
        this.tabRenderer.registerTab(new NoteTab());
        this.tabRenderer.registerTab(new PasswordTab());
        this.tabRenderer.registerTab(new DiaryTab());
        this.tabRenderer.registerTab(new DocumentTab())
        this.tabRenderer.registerTab(new AppointmentTab())
        this.tabRenderer.registerTab(new WeatherTab());
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