import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { DocumentService } from "../services/DocumentService";
import { Controls } from "../utils/Controls";

export class FolderAccessPage implements Page {
    hideNavBar = true;
    pageType: PageType = "FOLDER_ACCESS";

    async renderAsync(parent: HTMLElement, context: PageContext): Promise<void> {
        const locale = context.locale;
        const alerts = Controls.createDiv(parent);
        const back = Controls.createButton(parent, "button", locale.translate("BUTTON_BACK"), "btn btn-outline-secondary mb-3");
        back.addEventListener("click", async () => {
            context.documentItem.edit = null;
            context.pageType = "DESKTOP";
            await context.renderAsync();
        });
        try {
            const token = context.authenticationClient.getToken();
            if (!context.authenticationClient.isLoggedIn() || !token) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            const user = await context.authenticationClient.getUserInfoAsync();
            if (!user.roles.includes("usermanager")) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            const folder = context.documentItem.edit;
            if (!folder || folder.type !== "Folder") throw new Error("ERROR_INVALID_PARAMETERS");
            Controls.createHeading(parent, 4, "mb-3", `${locale.translate("DOCUMENTS_VISIBILITY")}: ${folder.name}`);
            Controls.createParagraph(parent, "alert alert-warning", locale.translate("DOCUMENTS_ACCESS_WARNING"));
            const form = Controls.createForm(parent);
            const fieldset = Controls.createElement(form, "fieldset") as HTMLFieldSetElement;
            const choices = [
                { value: "", key: "DOCUMENTS_PRIVATE" },
                { value: "family", key: "DOCUMENTS_FAMILY" },
                { value: "everbody", key: "DOCUMENTS_PUBLIC" }
            ] as const;
            let selected: "" | "family" | "everbody" = "";
            const original = folder.accessRole || "";
            if (!choices.some(choice => choice.value === original)) throw new Error("ERROR_DOCUMENT_ACCESS_ROLE");
            choices.forEach((choice, index) => {
                const row = Controls.createDiv(fieldset, "form-check mb-2");
                const input = Controls.createInput(row, "radio", `folder-access-${index}`, "form-check-input");
                input.name = "folder-access";
                input.value = choice.value;
                input.checked = original === choice.value;
                if (input.checked) selected = choice.value;
                input.addEventListener("change", () => { selected = choice.value; });
                Controls.createLabel(row, input.id, "form-check-label", locale.translate(choice.key));
            });
            const save = Controls.createButton(fieldset, "submit", locale.translate("BUTTON_SAVE"), "btn btn-primary mt-3");
            form.addEventListener("submit", async event => {
                event.preventDefault();
                if (fieldset.disabled) return;
                fieldset.disabled = true;
                back.disabled = true;
                Controls.removeAllChildren(alerts);
                try {
                    if (selected !== original) await DocumentService.setFolderAccessAsync(token, folder.id, selected);
                    context.documentItem.edit = null;
                    context.pageType = "DESKTOP";
                    await context.renderAsync();
                } catch (error: unknown) {
                    Controls.createAlert(alerts, locale.translateError(error));
                } finally {
                    fieldset.disabled = false;
                    back.disabled = false;
                }
            });
            save.focus();
        } catch (error: unknown) {
            Controls.createAlert(alerts, locale.translateError(error));
        }
    }
}
