import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { DocumentService } from "../services/DocumentService";
import { Controls } from "../utils/Controls";

export class MarkdownEditPage implements Page {
    hideNavBar = true;
    pageType: PageType = "MARKDOWN_EDIT";

    async renderAsync(parent: HTMLElement, context: PageContext): Promise<void> {
        const locale = context.locale;
        const alerts = Controls.createDiv(parent);
        const actions = Controls.createDiv(parent, "d-flex gap-2 my-3");
        const back = Controls.createButton(actions, "button", locale.translate("BUTTON_BACK"), "btn btn-outline-secondary");
        let dirty = false;
        let saving = false;
        const beforeUnload = (event: BeforeUnloadEvent): void => {
            event.preventDefault();
            event.returnValue = "";
        };
        const leave = async (): Promise<void> => {
            window.removeEventListener("beforeunload", beforeUnload);
            context.documentItem.edit = null;
            context.pageType = "DESKTOP";
            await context.renderAsync();
        };
        back.addEventListener("click", async () => { if (!saving && !dirty) await leave(); });
        try {
            const token = context.authenticationClient.getToken();
            if (!context.authenticationClient.isLoggedIn() || !token) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            const user = await context.authenticationClient.getUserInfoAsync();
            if (!user.roles.includes("usermanager")) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            const item = context.documentItem.edit;
            if (!item || item.type !== "Document" || !item.name.endsWith(".md") || !DocumentService.isShared(item)) {
                throw new Error("ERROR_INVALID_PARAMETERS");
            }
            const blob = await DocumentService.downloadBlobAsync(token, user, item);
            let original = await blob.text();
            Controls.createHeading(parent, 4, "mb-3", item.name);
            const save = Controls.createButton(actions, "button", locale.translate("BUTTON_SAVE"), "btn btn-primary");
            save.disabled = true;
            Controls.createLabel(parent, "markdown-content-id", "form-label", locale.translate("DOCUMENTS_EDIT_CONTENT"));
            const editor = Controls.createElement(parent, "textarea", "form-control font-monospace", undefined, "markdown-content-id") as HTMLTextAreaElement;
            editor.rows = 22;
            editor.maxLength = 1024 * 1024;
            editor.spellcheck = false;
            editor.value = original;
            original = editor.value;
            const dialog = Controls.createConfirmationDialog(parent, item.name, locale.translate("CONFIRMATION_SAVE"),
                locale.translate("BUTTON_YES"), locale.translate("BUTTON_NO"), "_markdown");
            dialog.querySelector<HTMLButtonElement>("#confirmationyesbutton-id_markdown")!.addEventListener("click", () => { void leave(); });
            editor.addEventListener("input", () => {
                context.updateActivity();
                dirty = editor.value !== original;
                save.disabled = !dirty;
                if (dirty) {
                    back.setAttribute("data-bs-toggle", "modal");
                    back.setAttribute("data-bs-target", "#confirmationdialog-id_markdown");
                    window.addEventListener("beforeunload", beforeUnload);
                } else {
                    back.removeAttribute("data-bs-toggle");
                    back.removeAttribute("data-bs-target");
                    window.removeEventListener("beforeunload", beforeUnload);
                }
            });
            save.addEventListener("click", async () => {
                if (saving || !dirty) return;
                saving = true;
                save.disabled = true;
                back.disabled = true;
                editor.disabled = true;
                Controls.removeAllChildren(alerts);
                try {
                    if (editor.value.length > 1024 * 1024) throw new Error("ERROR_FILE_TOO_LARGE");
                    await DocumentService.updateMarkdownAsync(token, item.id, editor.value);
                    original = editor.value;
                    dirty = false;
                    back.removeAttribute("data-bs-toggle");
                    back.removeAttribute("data-bs-target");
                    window.removeEventListener("beforeunload", beforeUnload);
                    context.authenticationClient.resetUserInfo();
                    Controls.createAlert(alerts, locale.translate("DOCUMENTS_CONTENT_SAVED"), "alert-success");
                } catch (error: unknown) {
                    Controls.createAlert(alerts, locale.translateError(error));
                } finally {
                    saving = false;
                    save.disabled = !dirty;
                    back.disabled = false;
                    editor.disabled = false;
                }
            });
        } catch (error: unknown) {
            Controls.createAlert(alerts, locale.translateError(error));
        }
    }
}
