import { PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { AccountExport } from "./AccountExport";
import { SettingsTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { SettingsTab } from "./SettingsTab";

export class AccountInformationTab implements SettingsTab {
    tabType: SettingsTabType = "ACCOUNT_INFORMATION";
    bootstrapIcon: string = "bi-info-circle";
    requiresAuthentication: boolean = true;
    private readonly exports = new AccountExport();

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        if (!pageContext.authenticationClient.isLoggedIn()) return;
        const locale = pageContext.locale;
        Controls.createHeading(parent, 4, "mt-3 mb-3", locale.translate("ACCOUNT_INFORMATION"));
        const card = Controls.createDiv(parent, "card p-4 shadow-sm");
        let accountUserId: number | null = null;
        try {
            pageContext.authenticationClient.resetUserInfo();
            const user = await pageContext.authenticationClient.getUserInfoAsync();
            accountUserId = user.id;
            Controls.createParagraph(card, "mb-0", locale.translateWithArgs("INFO_STORAGE_1_2", [
                DocumentService.formatSize(user.usedStorage), DocumentService.formatSize(user.storageQuota)
            ]));
        } catch (error: unknown) {
            Controls.createAlert(alertDiv, locale.translateError(error));
        }
        try {
            const lastLogin = await pageContext.authenticationClient.getLastLoginDateAsync();
            Controls.createParagraph(card, "mt-3 mb-0", lastLogin === null ? locale.translate("ACCOUNT_LAST_LOGIN_UNAVAILABLE") :
                locale.translateWithArgs("MESSAGE_LAST_LOGIN_1", [lastLogin.toLocaleString(locale.getLanguage(), { dateStyle: "long", timeStyle: "long" })]));
        } catch (error: unknown) {
            Controls.createAlert(Controls.createDiv(card, "mt-3"), locale.translateError(error));
        }
        this.exports.render(parent, pageContext, accountUserId);
    }
}
