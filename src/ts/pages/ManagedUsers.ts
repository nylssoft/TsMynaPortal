import { PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { ManagedUser, UserAdministrationService } from "../services/UserAdministrationService";
import { Controls } from "../utils/Controls";

const MB = 1024 * 1024;
const roles = ["usermanager", "family", "skatadmin"] as const;

export class ManagedUsers {
    async renderAsync(parent: HTMLElement, context: PageContext, token: string, currentUserId: number): Promise<void> {
        const locale = context.locale;
        Controls.createHeading(parent, 5, "mt-4 mb-3", locale.translate("ADMIN_USERS"));
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
            try {
                const users = await UserAdministrationService.getUsersAsync(token);
                this.renderList(content, context, users, currentUserId, async (user) => {
                    if (busy) return;
                    busy = true;
                    Controls.removeAllChildren(alerts);
                    try {
                        const storage = await UserAdministrationService.getStorageAsync(token, user.id);
                        this.renderDetails(content, context, token, user, storage, () => { void loadList(); });
                    } catch (error: unknown) {
                        showError(error);
                    } finally {
                        busy = false;
                    }
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
                }, () => { Controls.removeAllChildren(alerts); void loadList(); });
            } catch (error: unknown) {
                showError(error);
                const retry = Controls.createButton(content, "button", locale.translate("ADMIN_USER_REFRESH"), "btn btn-outline-secondary");
                retry.addEventListener("click", () => { Controls.removeAllChildren(alerts); void loadList(); });
            } finally {
                busy = false;
            }
        };
        await loadList();
    }

    private renderList(parent: HTMLElement, context: PageContext, users: ManagedUser[], currentUserId: number,
        open: (user: ManagedUser) => Promise<void>, remove: (users: ManagedUser[], setDisabled: (disabled: boolean) => void) => Promise<void>, refresh: () => void): void {
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
        const actions = Controls.createDiv(parent, "d-flex flex-wrap gap-2");
        const deleteButton = Controls.createButton(actions, "button", locale.translate("ADMIN_USER_DELETE"), "btn btn-outline-danger");
        const refreshButton = Controls.createButton(actions, "button", locale.translate("ADMIN_USER_REFRESH"), "btn btn-outline-secondary");
        const confirmation = Controls.createDiv(parent, "mt-3");
        const updateSelection = (): void => { deleteButton.disabled = !selections.some(item => item.input.checked); };
        selections.forEach(item => item.input.addEventListener("change", () => { Controls.removeAllChildren(confirmation); updateSelection(); }));
        updateSelection();
        refreshButton.addEventListener("click", refresh);
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
                    refreshButton.disabled = disabled;
                    selections.forEach(item => item.input.disabled = disabled || item.user.id === currentUserId);
                    list.querySelectorAll("button").forEach(button => button.disabled = disabled);
                });
            });
        });
    }

    private renderDetails(parent: HTMLElement, context: PageContext, token: string, user: ManagedUser, used: number, back: () => void): void {
        const locale = context.locale;
        Controls.removeAllChildren(parent);
        const alerts = Controls.createDiv(parent);
        const fieldset = Controls.createElement(parent, "fieldset") as HTMLFieldSetElement;
        Controls.createHeading(fieldset, 6, "mb-3", user.name);
        Controls.createParagraph(fieldset, "mb-1", locale.translateWithArgs("ADMIN_USER_EMAIL_1", [user.email]));
        const formatDate = (date: string | null): string => date === null ? locale.translate("ADMIN_REGISTRATION_DATE_UNKNOWN") : new Date(date).toLocaleString(locale.getLanguage(), { dateStyle: "medium", timeStyle: "short" });
        Controls.createParagraph(fieldset, "mb-1", locale.translateWithArgs("ADMIN_USER_REGISTERED_1", [formatDate(user.registeredUtc)]));
        Controls.createParagraph(fieldset, "mb-1", locale.translateWithArgs("ADMIN_USER_LAST_LOGIN_1", [formatDate(user.lastLoginUtc)]));
        Controls.createParagraph(fieldset, "mb-2", locale.translateWithArgs("ADMIN_USER_STORAGE_USED_1", [DocumentService.formatSize(used)]));
        const locked = Controls.createParagraph(fieldset, "text-warning", locale.translate("ADMIN_USER_LOCKED"));
        locked.hidden = !user.accountLocked;
        const quotaDiv = Controls.createDiv(fieldset, "mb-3");
        Controls.createLabel(quotaDiv, "admin-quota-id", "form-label", locale.translate("ADMIN_USER_QUOTA"));
        const quota = Controls.createInput(quotaDiv, "number", "admin-quota-id", "form-control");
        quota.min = "2"; quota.max = "1000"; quota.step = "1";
        quota.value = String(user.storageQuota / MB);
        const quotaButton = Controls.createButton(quotaDiv, "button", locale.translate("ADMIN_USER_SAVE_QUOTA"), "btn btn-outline-primary mt-2");
        const update = async (operation: () => Promise<boolean>, onSuccess: () => void, onFailure: () => void): Promise<void> => {
            if (fieldset.disabled) return;
            fieldset.disabled = true;
            Controls.removeAllChildren(alerts);
            try {
                if (!await operation()) throw new Error("ERROR_ADMIN_USER_UNCHANGED");
                onSuccess();
                Controls.createAlert(alerts, locale.translate("ADMIN_USER_UPDATED"), "alert-success");
            } catch (error: unknown) {
                onFailure();
                Controls.createAlert(alerts, locale.translateWithArgs("ADMIN_USER_UPDATE_FAILED_1", [locale.translateError(error)]));
            } finally {
                fieldset.disabled = false;
            }
        };
        quotaButton.addEventListener("click", () => {
            const amount = Number(quota.value);
            if (quota.value.trim() === "" || !Number.isInteger(amount) || amount < 2 || amount > 1000 || amount * MB <= used) {
                Controls.createAlert(alerts, locale.translate("ERROR_ADMIN_USER_QUOTA"));
                return;
            }
            if (amount * MB === user.storageQuota) return;
            void update(() => UserAdministrationService.updateQuotaAsync(token, user.id, amount * MB), () => { user.storageQuota = amount * MB; }, () => { quota.value = String(user.storageQuota / MB); });
        });
        const loginDiv = Controls.createDiv(fieldset, "form-check mb-3");
        const login = Controls.createInput(loginDiv, "checkbox", "admin-login-enabled-id", "form-check-input");
        login.checked = user.loginEnabled;
        Controls.createLabel(loginDiv, login.id, "form-check-label", locale.translate("ADMIN_USER_LOGIN_ENABLED"));
        login.addEventListener("change", () => {
            const enabled = login.checked;
            void update(() => UserAdministrationService.updateLoginAsync(token, user.id, enabled), () => { user.loginEnabled = enabled; }, () => { login.checked = user.loginEnabled; });
        });
        Controls.createDiv(fieldset, "mb-2", locale.translate("ADMIN_USER_ROLES"));
        roles.forEach(role => {
            const row = Controls.createDiv(fieldset, "form-check");
            const checkbox = Controls.createInput(row, "checkbox", `admin-role-${role}`, "form-check-input");
            checkbox.checked = user.roles.includes(role);
            Controls.createLabel(row, checkbox.id, "form-check-label", locale.translate(`ADMIN_ROLE_${role.toUpperCase()}`));
            checkbox.addEventListener("change", () => {
                const assigned = checkbox.checked;
                void update(() => UserAdministrationService.updateRoleAsync(token, user.name, role, assigned), () => {
                    user.roles = assigned ? [...user.roles, role] : user.roles.filter(value => value !== role);
                }, () => { checkbox.checked = user.roles.includes(role); });
            });
        });
        const actions = Controls.createDiv(fieldset, "d-flex gap-2 mt-3");
        if (user.accountLocked) {
            const unlock = Controls.createButton(actions, "button", locale.translate("ADMIN_USER_UNLOCK"), "btn btn-outline-primary");
            unlock.addEventListener("click", () => { void update(() => UserAdministrationService.unlockAsync(token, user.name), () => { user.accountLocked = false; locked.hidden = true; unlock.hidden = true; }, () => {}); });
        }
        const backButton = Controls.createButton(actions, "button", locale.translate("ADMIN_USER_BACK"), "btn btn-outline-secondary");
        backButton.addEventListener("click", back);
    }
}
