import { PageContext } from "../PageContext";
import { UserInfoResult } from "../TypeDefinitions";
import { ContactsExportService } from "../services/ContactsExportService";
import { DiaryExportService } from "../services/DiaryExportService";
import { DocumentsExportService } from "../services/DocumentsExportService";
import { ExportProgress } from "../services/ExportArchive";
import { NotesExportService } from "../services/NotesExportService";
import { PasswordsExportService } from "../services/PasswordsExportService";
import { Controls } from "../utils/Controls";

type ExportKind = "notes" | "diary" | "contacts" | "passwords" | "documents";

export class AccountExport {
    private busy = false;
    private kind: ExportKind = "notes";
    private url: string | null = null;
    private ownerId: number | null = null;
    private filename = "";
    private completed = 0;
    private total = 0;
    private message = "";
    private error: unknown;
    private refresh: (() => void) | null = null;

    render(parent: HTMLElement, context: PageContext, accountUserId: number | null): void {
        const locale = context.locale;
        if (this.url && (this.ownerId !== accountUserId || !context.authenticationClient.isLoggedIn())) {
            URL.revokeObjectURL(this.url);
            this.url = null;
        }
        const card = Controls.createDiv(parent, "card p-4 shadow-sm mt-3");
        Controls.createHeading(card, 5, "mb-3", locale.translate("ACCOUNT_EXPORT"));
        Controls.createParagraph(card, "small text-body-secondary", locale.translate("ACCOUNT_EXPORT_WARNING"));
        const alerts = Controls.createDiv(card);
        Controls.createLabel(card, "export-kind-id", "form-label", locale.translate("ACCOUNT_EXPORT_TYPE"));
        const select = Controls.createElement(card, "select", "form-select mb-3", undefined, "export-kind-id") as HTMLSelectElement;
        const kinds: ExportKind[] = ["notes", "diary", "contacts", "passwords", "documents"];
        kinds.forEach(kind => {
            const option = Controls.createElement(select, "option", "", locale.translate(`ACCOUNT_EXPORT_${kind.toUpperCase()}`)) as HTMLOptionElement;
            option.value = kind;
        });
        select.value = this.kind;
        const secrets = Controls.createDiv(card, `mb-3${this.kind === "passwords" ? "" : " d-none"}`);
        Controls.createParagraph(secrets, "small", locale.translate("ACCOUNT_EXPORT_PASSWORD_WARNING"));
        Controls.createLabel(secrets, "export-passphrase-id", "form-label", locale.translate("ACCOUNT_EXPORT_PASSPHRASE"));
        const password = Controls.createInput(secrets, "password", "export-passphrase-id", "form-control mb-2");
        password.autocomplete = "new-password";
        Controls.createLabel(secrets, "export-confirm-id", "form-label", locale.translate("ACCOUNT_EXPORT_CONFIRM"));
        const confirmation = Controls.createInput(secrets, "password", "export-confirm-id", "form-control");
        confirmation.autocomplete = "new-password";
        select.addEventListener("change", () => {
            const kind = kinds.find(value => value === select.value);
            if (kind) this.kind = kind;
            secrets.classList.toggle("d-none", select.value !== "passwords");
            password.value = "";
            confirmation.value = "";
        });
        const button = Controls.createButton(card, "button", locale.translate("ACCOUNT_EXPORT_START"), "btn btn-outline-primary align-self-start");
        Controls.createSpan(button, "bi bi-download ms-2").setAttribute("aria-hidden", "true");
        const progress = Controls.createElement(card, "progress", "w-100 mt-3") as HTMLProgressElement;
        progress.setAttribute("aria-label", locale.translate("ACCOUNT_EXPORT"));
        const status = Controls.createDiv(card, "small mt-2");
        status.setAttribute("role", "status");
        const download = Controls.createDiv(card, "mt-2");
        const update = (): void => {
            button.disabled = select.disabled = password.disabled = confirmation.disabled = this.busy;
            progress.hidden = !this.busy;
            if (this.total > 0 && this.completed < this.total) {
                progress.max = this.total;
                progress.value = this.completed;
            } else {
                progress.removeAttribute("value");
            }
            status.textContent = this.message === "ACCOUNT_EXPORT_PROGRESS_1_2" ?
                locale.translateWithArgs(this.message, [String(this.completed), String(this.total)]) : this.message ? locale.translate(this.message) : "";
            Controls.removeAllChildren(alerts);
            if (this.error !== undefined) Controls.createAlert(alerts, locale.translateError(this.error));
            Controls.removeAllChildren(download);
            if (this.url && this.ownerId === accountUserId && context.authenticationClient.isLoggedIn()) {
                const link = Controls.createAnchor(download, this.url, locale.translate("ACCOUNT_EXPORT_DOWNLOAD"), "link-primary");
                link.download = this.filename;
            }
        };
        this.refresh = update;
        update();
        button.addEventListener("click", async () => {
            if (this.busy) return;
            const kind = kinds.find(value => value === select.value);
            if (!kind) {
                Controls.createAlert(alerts, locale.translate("ERROR_EXPORT_RESPONSE"));
                return;
            }
            if (kind === "passwords" && (password.value.length < 12 || password.value !== confirmation.value)) {
                Controls.createAlert(alerts, locale.translate("ERROR_EXPORT_PASSPHRASE"));
                return;
            }
            const passphrase = password.value;
            password.value = confirmation.value = "";
            this.busy = true;
            this.error = undefined;
            this.message = "ACCOUNT_EXPORT_LOADING";
            this.completed = this.total = 0;
            if (this.url) URL.revokeObjectURL(this.url);
            this.url = null;
            this.refresh?.();
            try {
                const token = context.authenticationClient.getToken();
                if (!context.authenticationClient.isLoggedIn() || !token) throw new Error("ERROR_INVALID_TOKEN");
                context.authenticationClient.resetUserInfo();
                const user = await context.authenticationClient.getUserInfoAsync();
                if (user.id !== accountUserId) throw new Error("ERROR_INVALID_TOKEN");
                const onProgress: ExportProgress = (completed, total) => {
                    this.completed = completed;
                    this.total = total;
                    this.message = total === 0 ? "ACCOUNT_EXPORT_LOADING" : completed === total ? "ACCOUNT_EXPORT_PACKAGING" : "ACCOUNT_EXPORT_PROGRESS_1_2";
                    this.refresh?.();
                };
                const exporters: Record<Exclude<ExportKind, "passwords">, (token: string, user: UserInfoResult, progress: ExportProgress) => Promise<Blob | null>> = {
                    notes: NotesExportService.exportAsync,
                    diary: DiaryExportService.exportAsync,
                    contacts: ContactsExportService.exportAsync,
                    documents: DocumentsExportService.exportAsync
                };
                const blob = kind === "passwords" ? await PasswordsExportService.exportAsync(token, user, onProgress, passphrase) :
                    await exporters[kind](token, user, onProgress);
                if (!context.authenticationClient.isLoggedIn() || context.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
                if (blob === null) {
                    this.message = "ACCOUNT_EXPORT_EMPTY";
                } else {
                    this.ownerId = user.id;
                    this.filename = `myna-${kind}-${new Date().toISOString().slice(0, 10)}.zip`;
                    this.url = URL.createObjectURL(blob);
                    this.message = "ACCOUNT_EXPORT_READY";
                    this.refresh?.();
                    const link = Controls.createAnchor(download, this.url, "");
                    link.download = this.filename;
                    link.click();
                    download.removeChild(link);
                }
            } catch (error: unknown) {
                this.error = error;
                this.message = "";
            } finally {
                this.busy = false;
                this.refresh?.();
            }
        });
    }
}
