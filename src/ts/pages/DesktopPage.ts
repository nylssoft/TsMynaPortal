import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { BirthdayTab } from "../tabs/BirthdayTab";
import { ContactTab } from "../tabs/ContactTab";
import { NoteTab } from "../tabs/NoteTab";
import { PasswordTab } from "../tabs/PasswordTab";
import { DiaryTab } from "../tabs/DiaryTab";
import { TabRenderer } from "../tabs/TabRenderer";
import { DocumentTab } from "../tabs/DocumentTab";
import { AppointmentTab } from "../tabs/AppointmentTab";

/**
 * Page implementation for the Desktop page.
 */
export class DesktopPage implements Page {

    pageType: PageType = "DESKTOP";

    private readonly tabRenderer: TabRenderer = new TabRenderer();

    constructor() {
        this.tabRenderer.registerTab(new BirthdayTab());
        this.tabRenderer.registerTab(new ContactTab());
        this.tabRenderer.registerTab(new NoteTab());
        this.tabRenderer.registerTab(new PasswordTab());
        this.tabRenderer.registerTab(new DiaryTab());
        this.tabRenderer.registerTab(new DocumentTab())
        this.tabRenderer.registerTab(new AppointmentTab())
    }

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            if (!pageContext.desktop.welcomeClosed) {
                await this.renderWelcomeMessageAsync(parent, pageContext);
            }
            await this.tabRenderer.renderTabsAsync(pageContext, parent, alertDiv);
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
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
        welcomeElem.addEventListener('closed.bs.alert', _ => pageContext.desktop.welcomeClosed = true);
    }
}