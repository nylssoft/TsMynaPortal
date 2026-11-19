import { PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { NotesExportService } from "../services/NotesExportService";
import { SettingsTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { SettingsTab } from "./SettingsTab";

export class AccountInformationTab implements SettingsTab {
    tabType: SettingsTabType = "ACCOUNT_INFORMATION";
    bootstrapIcon: string = "bi-info-circle";
    requiresAuthentication: boolean = true;
    private exporting = false;
    private downloadUrl: string | null = null;
    private downloadUserId: number | null = null;
    private completeExport: ((message: string, error?: unknown) => void) | null = null;

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
        const exportCard = Controls.createDiv(parent, "card p-4 shadow-sm mt-3");
        Controls.createHeading(exportCard, 5, "mb-3", locale.translate("ACCOUNT_EXPORT_NOTES"));
        Controls.createParagraph(exportCard, "small text-body-secondary", locale.translate("ACCOUNT_EXPORT_WARNING"));
        const exportAlerts = Controls.createDiv(exportCard);
        const exportButton = Controls.createButton(exportCard, "button", locale.translate("ACCOUNT_EXPORT_NOTES"), "btn btn-outline-primary align-self-start");
        Controls.createSpan(exportButton, "bi bi-download ms-2").setAttribute("aria-hidden", "true");
        const progress = Controls.createElement(exportCard, "progress", "w-100 mt-3") as HTMLProgressElement;
        progress.setAttribute("aria-label", locale.translate("ACCOUNT_EXPORT_NOTES"));
        progress.hidden = true;
        const status = Controls.createDiv(exportCard, "small mt-2");
        status.setAttribute("role", "status");
        const download = Controls.createDiv(exportCard, "mt-2");
        const showDownload = (): HTMLAnchorElement | null => {
            Controls.removeAllChildren(download);
            if (this.downloadUrl === null) return null;
            if (this.downloadUserId !== accountUserId || !pageContext.authenticationClient.isLoggedIn()) {
                URL.revokeObjectURL(this.downloadUrl);
                this.downloadUrl = null;
                return null;
            }
            const link = Controls.createAnchor(download, this.downloadUrl, locale.translate("ACCOUNT_EXPORT_DOWNLOAD"), "link-primary");
            link.download = `myna-notes-${new Date().toISOString().slice(0, 10)}.zip`;
            return link;
        };
        this.completeExport = (message, error) => {
            progress.hidden = true;
            exportButton.disabled = false;
            status.textContent = message;
            if (error !== undefined) Controls.createAlert(exportAlerts, locale.translateError(error));
            showDownload();
        };
        exportButton.disabled = this.exporting;
        if (this.exporting) {
            progress.hidden = false;
            status.textContent = locale.translate("ACCOUNT_EXPORT_BUSY");
        } else {
            showDownload();
        }
        exportButton.addEventListener("click", async () => {
            if (this.exporting) return;
            this.exporting = true;
            exportButton.disabled = true;
            Controls.removeAllChildren(exportAlerts);
            Controls.removeAllChildren(download);
            if (this.downloadUrl !== null) {
                URL.revokeObjectURL(this.downloadUrl);
                this.downloadUrl = null;
            }
            progress.hidden = false;
            progress.removeAttribute("value");
            status.textContent = locale.translate("ACCOUNT_EXPORT_LOADING");
            try {
                const token = pageContext.authenticationClient.getToken();
                if (!pageContext.authenticationClient.isLoggedIn() || !token) throw new Error("ERROR_INVALID_TOKEN");
                const user = await pageContext.authenticationClient.getUserInfoAsync();
                accountUserId = user.id;
                const blob = await NotesExportService.exportAsync(token, user, (completed, total) => {
                    if (completed === total && total > 0) {
                        progress.removeAttribute("value");
                        status.textContent = locale.translate("ACCOUNT_EXPORT_PACKAGING");
                    } else {
                        progress.max = Math.max(total, 1);
                        progress.value = completed;
                        status.textContent = locale.translateWithArgs("ACCOUNT_EXPORT_PROGRESS_1_2", [String(completed), String(total)]);
                    }
                });
                if (blob === null) {
                    status.textContent = locale.translate("ACCOUNT_EXPORT_EMPTY");
                    return;
                }
                if (!pageContext.authenticationClient.isLoggedIn() || pageContext.authenticationClient.getToken() !== token) {
                    throw new Error("ERROR_INVALID_TOKEN");
                }
                this.downloadUserId = user.id;
                this.downloadUrl = URL.createObjectURL(blob);
                status.textContent = locale.translate("ACCOUNT_EXPORT_READY");
                showDownload()?.click();
            } catch (error: unknown) {
                status.textContent = "";
                this.completeExport?.("", error);
            } finally {
                progress.hidden = true;
                this.exporting = false;
                exportButton.disabled = false;
                this.completeExport?.(status.textContent);
            }
        });
    }
}
