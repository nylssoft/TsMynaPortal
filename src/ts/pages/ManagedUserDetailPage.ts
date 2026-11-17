import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { DocumentService } from "../services/DocumentService";
import { ManagedUser, UserAdministrationService } from "../services/UserAdministrationService";
import { Controls } from "../utils/Controls";

const MB = 1024 * 1024;
const roles = ["usermanager", "family", "skatadmin"] as const;

export class ManagedUserDetailPage implements Page {
    hideNavBar = true;
    pageType: PageType = "MANAGED_USER_DETAIL";

    async renderAsync(parent: HTMLElement, context: PageContext): Promise<void> {
        const locale = context.locale;
        const heading = Controls.createHeading(parent, 4, "my-2 d-flex align-items-center gap-3");
        const back = Controls.createButton(heading, "button", "", "btn btn-link p-0 fs-4");
        back.setAttribute("aria-label", locale.translate("BUTTON_BACK"));
        back.title = locale.translate("BUTTON_BACK");
        Controls.createSpan(back, "bi bi-arrow-left");
        Controls.createSpan(heading, "", locale.translate("ADMIN_USERS"));
        back.addEventListener("click", async () => {
            context.managedUserId = null;
            context.administrationTab = "USERS";
            context.pageType = "ADMINISTRATION";
            await context.renderAsync();
        });
        const alerts = Controls.createDiv(parent);
        try {
            const token = context.authenticationClient.getToken();
            if (!context.authenticationClient.isLoggedIn() || !token) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            const administrator = await context.authenticationClient.getUserInfoAsync();
            if (!administrator.roles.includes("usermanager")) throw new Error("ERROR_ADMINISTRATION_ACCESS");
            if (context.managedUserId === null) throw new Error("ERROR_INVALID_PARAMETERS");
            const users = await UserAdministrationService.getUsersAsync(token);
            const user = users.find(item => item.id === context.managedUserId);
            if (!user) throw new Error("ERROR_INVALID_PARAMETERS");
            const used = await UserAdministrationService.getStorageAsync(token, user.id);
            const card = Controls.createDiv(parent, "card p-3 shadow-sm");
            this.renderDetails(card, context, token, user, used, alerts, back);
        } catch (error: unknown) {
            Controls.createAlert(alerts, locale.translateError(error));
        }
    }

    private renderDetails(parent: HTMLElement, context: PageContext, token: string, user: ManagedUser, used: number,
        alerts: HTMLDivElement, back: HTMLButtonElement): void {
        const locale = context.locale;
        const fieldset = Controls.createElement(parent, "fieldset") as HTMLFieldSetElement;
        if (user.photo) {
            const photo = Controls.createElement(fieldset, "img", "rounded mb-3") as HTMLImageElement;
            photo.src = user.photo;
            photo.alt = "";
            photo.width = 64;
            photo.height = 64;
        }
        Controls.createHeading(fieldset, 5, "mb-3", user.name);
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
            back.disabled = true;
            Controls.removeAllChildren(alerts);
            try {
                if (!await operation()) throw new Error("ERROR_ADMIN_USER_UNCHANGED");
                onSuccess();
                context.authenticationClient.resetUserInfo();
                Controls.createAlert(alerts, locale.translate("ADMIN_USER_UPDATED"), "alert-success");
            } catch (error: unknown) {
                onFailure();
                Controls.createAlert(alerts, locale.translateWithArgs("ADMIN_USER_UPDATE_FAILED_1", [locale.translateError(error)]));
            } finally {
                fieldset.disabled = false;
                back.disabled = false;
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
        if (user.accountLocked) {
            const unlock = Controls.createButton(fieldset, "button", locale.translate("ADMIN_USER_UNLOCK"), "btn btn-outline-primary mt-3");
            unlock.addEventListener("click", () => { void update(() => UserAdministrationService.unlockAsync(token, user.name), () => { user.accountLocked = false; locked.hidden = true; unlock.hidden = true; }, () => {}); });
        }
    }
}
