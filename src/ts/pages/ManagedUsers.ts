import { PageContext } from "../PageContext";
import { ManagedUser, UserAdministrationService } from "../services/UserAdministrationService";
import { Controls } from "../utils/Controls";

const roles = ["usermanager", "family", "skatadmin"] as const;

export class ManagedUsers {
    async renderAsync(parent: HTMLElement, context: PageContext, token: string, currentUserId: number): Promise<void> {
        const locale = context.locale;
        const heading = Controls.createHeading(parent, 5, "mt-4 mb-3", locale.translate("ADMIN_USERS"));
        const alerts = Controls.createDiv(parent);
        const results = Controls.createDiv(parent);
        results.setAttribute("role", "status");
        const content = Controls.createDiv(parent);
        let busy = false;

        const showError = (error: unknown): void => {
            Controls.createAlert(alerts, locale.translateError(error));
        };
        const loadList = async (): Promise<void> => {
            if (busy) return;
            busy = true;
            Controls.removeAllChildren(content);
            Controls.removeAllChildren(heading);
            heading.textContent = locale.translate("ADMIN_USERS");
            try {
                const users = await UserAdministrationService.getUsersAsync(token);
                this.renderList(content, heading, context, users, currentUserId, async (user) => {
                    if (busy) return;
                    context.managedUserId = user.id;
                    context.administrationTab = "USERS";
                    context.pageType = "MANAGED_USER_DETAIL";
                    await context.renderAsync();
                }, async (usersToDelete, setDisabled) => {
                    if (busy) return;
                    busy = true;
                    setDisabled(true);
                    Controls.removeAllChildren(alerts);
                    Controls.removeAllChildren(results);
                    for (const user of usersToDelete) {
                        try {
                            const deleted = await UserAdministrationService.deleteAsync(token, user.name);
                            if (!deleted) throw new Error("ERROR_ADMIN_USER_UNCHANGED");
                            Controls.createDiv(results, "alert alert-success py-2", locale.translateWithArgs("ADMIN_USER_DELETED_1", [user.name]));
                        } catch (error: unknown) {
                            Controls.createDiv(results, "alert alert-danger py-2", locale.translateWithArgs("ADMIN_USER_DELETE_FAILED_1_2", [user.name, locale.translateError(error)]));
                        }
                    }
                    busy = false;
                    await loadList();
                });
            } catch (error: unknown) {
                showError(error);
            } finally {
                busy = false;
            }
        };
        await loadList();
    }

    private renderList(parent: HTMLElement, heading: HTMLHeadingElement, context: PageContext, users: ManagedUser[], currentUserId: number,
        open: (user: ManagedUser) => Promise<void>, remove: (users: ManagedUser[], setDisabled: (disabled: boolean) => void) => Promise<void>): void {
        const locale = context.locale;
        Controls.removeAllChildren(parent);
        if (users.length === 0) Controls.createParagraph(parent, "text-body-secondary", locale.translate("ADMIN_USER_EMPTY"));
        const selections: { user: ManagedUser; input: HTMLInputElement }[] = [];
        const list = Controls.createDiv(parent, "list-group mb-3");
        users.forEach(user => {
            const row = Controls.createDiv(list, "list-group-item d-flex align-items-center gap-2");
            const checkbox = Controls.createInput(row, "checkbox", `admin-user-${user.id}`, "form-check-input flex-shrink-0");
            checkbox.disabled = user.id === currentUserId;
            checkbox.setAttribute("aria-label", locale.translateWithArgs("ADMIN_USER_SELECT_1", [user.name]));
            selections.push({ user, input: checkbox });
            if (user.photo) {
                const photo = Controls.createElement(row, "img", "rounded flex-shrink-0") as HTMLImageElement;
                photo.src = user.photo;
                photo.alt = "";
                photo.width = 40;
                photo.height = 40;
            }
            const summary = Controls.createDiv(row, "flex-grow-1");
            const button = Controls.createButton(summary, "button", user.name, "btn btn-link text-start p-0");
            button.addEventListener("click", () => { void open(user); });
            if (user.accountLocked) Controls.createSpan(summary, "badge text-bg-warning ms-2", locale.translate("ADMIN_USER_LOCKED"));
            if (!user.loginEnabled) Controls.createSpan(summary, "badge text-bg-secondary ms-2", locale.translate("ADMIN_USER_LOGIN_DISABLED"));
            const roleNames = user.roles.map(role => roles.some(known => known === role) ? locale.translate(`ADMIN_ROLE_${role.toUpperCase()}`) : role);
            if (roleNames.length > 0) Controls.createDiv(summary, "small text-body-secondary", roleNames.join(", "));
            if (user.lastLoginUtc) Controls.createDiv(summary, "small text-body-secondary", locale.translateWithArgs("ADMIN_USER_LAST_LOGIN_1", [new Date(user.lastLoginUtc).toLocaleString(locale.getLanguage(), { dateStyle: "medium", timeStyle: "short" })]));
        });
        Controls.createParagraph(parent, "small text-body-secondary", locale.translate("ADMIN_USER_SELF_DELETE"));
        const deleteButton = Controls.createButton(heading, "button", "", "btn btn-link text-body p-0 ms-4 fs-5");
        deleteButton.title = locale.translate("ADMIN_USER_DELETE");
        deleteButton.setAttribute("aria-label", deleteButton.title);
        Controls.createSpan(deleteButton, "bi bi-trash");
        const confirmation = Controls.createDiv(parent, "mt-3");
        const updateSelection = (): void => {
            deleteButton.disabled = !selections.some(item => item.input.checked);
            deleteButton.style.visibility = deleteButton.disabled ? "hidden" : "visible";
        };
        selections.forEach(item => item.input.addEventListener("change", () => { Controls.removeAllChildren(confirmation); updateSelection(); }));
        updateSelection();
        deleteButton.addEventListener("click", () => {
            const chosen = selections.filter(item => item.input.checked).map(item => item.user);
            if (chosen.length === 0) return;
            Controls.removeAllChildren(confirmation);
            Controls.createParagraph(confirmation, "alert alert-warning", locale.translateWithArgs("ADMIN_USER_CONFIRM_DELETE_1", [chosen.map(user => user.name).join(", ")]));
            const yes = Controls.createButton(confirmation, "button", locale.translate("BUTTON_YES"), "btn btn-danger me-2");
            const no = Controls.createButton(confirmation, "button", locale.translate("BUTTON_NO"), "btn btn-outline-secondary");
            no.addEventListener("click", () => Controls.removeAllChildren(confirmation));
            yes.addEventListener("click", () => {
                void remove(chosen, disabled => {
                    yes.disabled = disabled;
                    no.disabled = disabled;
                    deleteButton.disabled = disabled;
                    selections.forEach(item => item.input.disabled = disabled || item.user.id === currentUserId);
                    list.querySelectorAll("button").forEach(button => button.disabled = disabled);
                });
            });
        });
    }
}
