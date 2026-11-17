import { PageContext } from "../PageContext";
import { RegistrationAdministrationService, RegistrationRequest } from "../services/RegistrationAdministrationService";
import { Controls } from "../utils/Controls";

export class RegistrationRequests {
    async renderAsync(parent: HTMLElement, pageContext: PageContext, token: string): Promise<void> {
        const locale = pageContext.locale;
        Controls.createHeading(parent, 5, "mt-4 mb-3", locale.translate("ADMIN_REGISTRATIONS"));
        const alerts = Controls.createDiv(parent);
        const results = Controls.createDiv(parent, "mb-3");
        results.setAttribute("role", "status");
        const list = Controls.createDiv(parent, "mb-3");
        const options = Controls.createDiv(parent, "form-check mb-3");
        const notification = Controls.createInput(options, "checkbox", "registration-notification-id", "form-check-input");
        Controls.createLabel(options, notification.id, "form-check-label", locale.translate("ADMIN_REGISTRATION_NOTIFY"));
        const actions = Controls.createDiv(parent, "d-flex flex-wrap gap-2");
        const approve = Controls.createButton(actions, "button", locale.translate("ADMIN_REGISTRATION_APPROVE"), "btn btn-primary");
        const reject = Controls.createButton(actions, "button", locale.translate("ADMIN_REGISTRATION_REJECT"), "btn btn-outline-danger");
        let selected: { request: RegistrationRequest; checkbox: HTMLInputElement }[] = [];
        let busy = false;

        const updateControls = (): void => {
            const hasSelection = selected.some(item => item.checkbox.checked);
            approve.disabled = busy || !hasSelection;
            reject.disabled = busy || !hasSelection;
            notification.disabled = busy;
            selected.forEach(item => item.checkbox.disabled = busy);
        };

        const load = async (): Promise<void> => {
            Controls.removeAllChildren(list);
            selected = [];
            updateControls();
            try {
                const requests = await RegistrationAdministrationService.getRequestsAsync(token);
                if (requests.length === 0) {
                    Controls.createParagraph(list, "text-body-secondary", locale.translate("ADMIN_REGISTRATION_EMPTY"));
                }
                requests.forEach((request, index) => {
                    const row = Controls.createDiv(list, "form-check mb-2");
                    const checkbox = Controls.createInput(row, "checkbox", `registration-request-${index}`, "form-check-input");
                    const date = request.requestedUtc === null ? locale.translate("ADMIN_REGISTRATION_DATE_UNKNOWN") :
                        new Date(request.requestedUtc).toLocaleString(locale.getLanguage(), { dateStyle: "medium", timeStyle: "short" });
                    Controls.createLabel(row, checkbox.id, "form-check-label", `${request.email} — ${date}`);
                    checkbox.addEventListener("change", updateControls);
                    selected.push({ request, checkbox });
                });
            } catch (error: Error | unknown) {
                Controls.createAlert(alerts, locale.translateError(error));
            }
            updateControls();
        };

        const process = async (isRejection: boolean): Promise<void> => {
            if (busy) return;
            const requests = selected.filter(item => item.checkbox.checked).map(item => item.request);
            if (requests.length === 0) return;
            busy = true;
            updateControls();
            Controls.removeAllChildren(alerts);
            Controls.removeAllChildren(results);
            const sendNotification = notification.checked;
            for (const request of requests) {
                try {
                    const code = await RegistrationAdministrationService.processRequestAsync(token, request.email, sendNotification, isRejection);
                    const message = code === null ? locale.translateWithArgs("ADMIN_REGISTRATION_REJECTED_1", [request.email]) :
                        locale.translateWithArgs("ADMIN_REGISTRATION_APPROVED_1_2", [request.email, code]);
                    Controls.createDiv(results, "alert alert-success py-2", message);
                } catch (error: Error | unknown) {
                    const message = locale.translateWithArgs("ADMIN_REGISTRATION_FAILED_1_2", [request.email, locale.translateError(error)]);
                    Controls.createDiv(results, "alert alert-danger py-2", message);
                }
            }
            await load();
            busy = false;
            updateControls();
        };

        approve.addEventListener("click", () => { void process(false); });
        reject.addEventListener("click", () => { void process(true); });
        busy = true;
        updateControls();
        await load();
        busy = false;
        updateControls();
    }
}
