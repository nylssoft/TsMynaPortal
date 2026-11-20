import { PageContext } from "../PageContext";
import { SettingsTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { AccountExport } from "./AccountExport";
import { AccountImport } from "./AccountImport";
import { SettingsTab } from "./SettingsTab";

export class AccountDataTab implements SettingsTab {
    readonly requiresAuthentication = true;
    readonly bootstrapIcon: string;
    private readonly panel: AccountExport | AccountImport;

    constructor(readonly tabType: Extract<SettingsTabType, "ACCOUNT_EXPORT" | "ACCOUNT_IMPORT">) {
        this.bootstrapIcon = tabType === "ACCOUNT_EXPORT" ? "bi-download" : "bi-upload";
        this.panel = tabType === "ACCOUNT_EXPORT" ? new AccountExport() : new AccountImport();
    }

    async renderAsync(context: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        if (!context.authenticationClient.isLoggedIn()) return;
        Controls.createHeading(parent, 4, "mt-3 mb-3", context.locale.translate(this.tabType));
        try {
            context.authenticationClient.resetUserInfo();
            const user = await context.authenticationClient.getUserInfoAsync();
            this.panel.render(parent, context, user.id);
        } catch (error: unknown) {
            Controls.createAlert(alertDiv, context.locale.translateError(error));
        }
    }
}
