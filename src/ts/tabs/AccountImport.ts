import { PageContext } from "../PageContext";
import { AccountImportService, ImportKind } from "../services/AccountImportService";
import { Controls } from "../utils/Controls";
import { Security } from "../utils/Security";

export class AccountImport {
    private busy = false;
    private kind: ImportKind = "notes";
    private status = "";
    private completed = 0;
    private total = 0;
    private error: unknown;
    private partial = false;
    private refresh: (() => void) | null = null;

    render(parent: HTMLElement, context: PageContext, accountId: number | null): void {
        const locale = context.locale;
        const card = Controls.createDiv(parent, "card p-4 shadow-sm");
        Controls.createParagraph(card, "small text-body-secondary", locale.translate("ACCOUNT_IMPORT_WARNING"));
        const alerts = Controls.createDiv(card);
        Controls.createLabel(card, "import-kind-id", "form-label", locale.translate("ACCOUNT_EXPORT_TYPE"));
        const select = Controls.createElement(card, "select", "form-select mb-3", undefined, "import-kind-id") as HTMLSelectElement;
        const kinds: ImportKind[] = ["notes", "diary", "contacts", "passwords", "documents"];
        kinds.forEach(kind => {
            const option = Controls.createElement(select, "option", "", locale.translate(`ACCOUNT_EXPORT_${kind.toUpperCase()}`)) as HTMLOptionElement;
            option.value = kind;
        });
        select.value = this.kind;
        const secrets = Controls.createDiv(card, `mb-3${this.kind === "passwords" ? "" : " d-none"}`);
        Controls.createLabel(secrets, "import-passphrase-id", "form-label", locale.translate("ACCOUNT_IMPORT_PASSPHRASE"));
        const password = Controls.createInput(secrets, "password", "import-passphrase-id", "form-control");
        password.autocomplete = "off";
        select.addEventListener("change", () => {
            const kind = kinds.find(item => item === select.value);
            if (kind) this.kind = kind;
            secrets.classList.toggle("d-none", this.kind !== "passwords");
            password.value = "";
        });
        Controls.createLabel(card, "import-file-id", "form-label", locale.translate("ACCOUNT_IMPORT_FILE"));
        const input = Controls.createInput(card, "file", "import-file-id", "form-control mb-3");
        input.accept = ".zip,application/zip";
        const button = Controls.createButton(card, "button", locale.translate("ACCOUNT_IMPORT_START"), "btn btn-outline-primary align-self-start");
        const progress = Controls.createElement(card, "progress", "w-100 mt-3") as HTMLProgressElement;
        progress.setAttribute("aria-label", locale.translate("ACCOUNT_IMPORT"));
        const status = Controls.createDiv(card, "small mt-2");
        status.setAttribute("role", "status");
        const update = (): void => {
            select.disabled = input.disabled = password.disabled = button.disabled = this.busy;
            progress.hidden = !this.busy;
            if (this.total) { progress.max = this.total; progress.value = this.completed; }
            else progress.removeAttribute("value");
            status.textContent = this.status ? locale.translate(this.status) : "";
            if (this.busy && this.total) status.textContent = locale.translateWithArgs("ACCOUNT_IMPORT_PROGRESS_1_2", [String(this.completed), String(this.total)]);
            Controls.removeAllChildren(alerts);
            if (this.error !== undefined) {
                const message = locale.translateError(this.error);
                Controls.createAlert(alerts, this.partial ? locale.translateWithArgs("ACCOUNT_IMPORT_PARTIAL_1", [message]) : message);
            }
        };
        this.refresh = update;
        update();
        button.addEventListener("click", async () => {
            if (this.busy) return;
            const kind = kinds.find(item => item === select.value);
            const file = input.files?.[0];
            if (!kind || !file) { Controls.createAlert(alerts, locale.translate("ERROR_IMPORT_FILE")); return; }
            const passphrase = password.value;
            password.value = "";
            if (kind === "passwords" && !passphrase) { Controls.createAlert(alerts, locale.translate("ERROR_IMPORT_PASSPHRASE")); return; }
            this.busy = true;
            this.error = undefined;
            this.partial = false;
            this.completed = this.total = 0;
            this.status = "ACCOUNT_IMPORT_CHECKING";
            this.refresh?.();
            let attempted = false;
            try {
                const token = context.authenticationClient.getToken();
                if (!context.authenticationClient.isLoggedIn() || !token || accountId === null) throw new Error("ERROR_INVALID_TOKEN");
                const check = async () => {
                    if (!context.authenticationClient.isLoggedIn() || context.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
                    context.authenticationClient.resetUserInfo();
                    const user = await context.authenticationClient.getUserInfoAsync();
                    if (user.id !== accountId || !context.authenticationClient.isLoggedIn() || context.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
                    return user;
                };
                await check();
                const actions = await AccountImportService.prepareAsync(kind, file, passphrase, locale.translate("ACCOUNT_EXPORT_DOCUMENTS"));
                const user = await check();
                if (!await Security.getEncryptionKeyAsync(user)) throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
                if (!context.authenticationClient.isLoggedIn() || context.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
                const hasData = { notes: user.hasNotes, diary: user.hasDiary, contacts: user.hasContacts, passwords: user.hasPasswordManagerFile, documents: user.hasDocuments }[kind];
                if (typeof hasData !== "boolean") throw new Error("ERROR_IMPORT_EXISTING");
                if (hasData) {
                    const message = kind === "diary" ? locale.translate("ACCOUNT_IMPORT_CONFIRM_DIARY") :
                        locale.translateWithArgs("ACCOUNT_IMPORT_CONFIRM_EXISTING_1", [locale.translate(`ACCOUNT_EXPORT_${kind.toUpperCase()}`)]);
                    if (!await this.confirmAsync(card, context, message)) {
                        this.status = "";
                        return;
                    }
                }
                this.total = actions.length;
                this.refresh?.();
                for (const action of actions) {
                    if (!context.authenticationClient.isLoggedIn() || context.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
                    attempted = true;
                    await action(token, user);
                    this.completed++;
                    this.refresh?.();
                }
                this.status = kind === "diary" ? "ACCOUNT_IMPORT_DIARY_DONE" : "ACCOUNT_IMPORT_DONE";
                input.value = "";
            } catch (error: unknown) {
                this.error = error;
                this.partial = attempted;
                this.status = "";
            } finally {
                context.authenticationClient.resetUserInfo();
                this.busy = false;
                this.refresh?.();
            }
        });
    }

    private async confirmAsync(origin: HTMLElement, context: PageContext, message: string): Promise<boolean> {
        if (!origin.isConnected) return false;
        const locale = context.locale;
        const dialog = Controls.createElement(document.body, "dialog", "modal d-block mw-100 mh-100 m-0 p-0 border-0 bg-transparent") as HTMLDialogElement;
        dialog.setAttribute("aria-labelledby", "import-confirm-title");
        dialog.setAttribute("aria-describedby", "import-confirm-message");
        const modalDialog = Controls.createDiv(dialog, "modal-dialog modal-dialog-centered");
        const content = Controls.createDiv(modalDialog, "modal-content shadow");
        const header = Controls.createDiv(content, "modal-header");
        Controls.createHeading(header, 2, "modal-title fs-5", locale.translate("ACCOUNT_IMPORT")).id = "import-confirm-title";
        const close = Controls.createButton(header, "button", "", "btn-close");
        close.setAttribute("aria-label", locale.translate("ACCOUNT_IMPORT_CANCEL"));
        const body = Controls.createDiv(content, "modal-body");
        Controls.createParagraph(body, "mb-0", message).id = "import-confirm-message";
        const footer = Controls.createDiv(content, "modal-footer");
        const cancel = Controls.createButton(footer, "button", locale.translate("ACCOUNT_IMPORT_CANCEL"), "btn btn-secondary");
        const confirm = Controls.createButton(footer, "button", locale.translate("ACCOUNT_IMPORT_CONTINUE"), "btn btn-primary");
        cancel.setAttribute("autofocus", "");
        close.addEventListener("click", () => dialog.close());
        cancel.addEventListener("click", () => dialog.close());
        confirm.addEventListener("click", () => dialog.close("confirm"));
        dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
        return await new Promise<boolean>((resolve, reject) => {
            const observer = new MutationObserver(() => { if (!origin.isConnected && dialog.open) dialog.close(); });
            observer.observe(document.body, { childList: true, subtree: true });
            dialog.addEventListener("close", () => {
                observer.disconnect();
                const accepted = dialog.returnValue === "confirm" && origin.isConnected;
                dialog.remove();
                resolve(accepted);
            }, { once: true });
            try {
                dialog.showModal();
            } catch (error: unknown) {
                observer.disconnect();
                dialog.remove();
                reject(error);
            }
        });
    }
}
