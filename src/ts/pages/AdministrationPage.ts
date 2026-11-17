import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { RegistrationRequests } from "./RegistrationRequests";
import { ManagedUsers } from "./ManagedUsers";

export class AdministrationPage implements Page {

    pageType: PageType = "ADMINISTRATION";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        if (!pageContext.authenticationClient.isLoggedIn()) {
            Controls.createAlert(parent, pageContext.locale.translate("ERROR_ADMINISTRATION_ACCESS"));
            return;
        }
        const user = await pageContext.authenticationClient.getUserInfoAsync();
        if (!user.roles.includes("usermanager")) {
            Controls.createAlert(parent, pageContext.locale.translate("ERROR_ADMINISTRATION_ACCESS"));
            return;
        }
        Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("ADMINISTRATION"));
        const token = pageContext.authenticationClient.getToken();
        if (!token) {
            Controls.createAlert(parent, pageContext.locale.translate("ERROR_ADMINISTRATION_ACCESS"));
            return;
        }
        const tabs = Controls.createElement(parent, "ul", "nav nav-pills");
        const tasks = [
            { type: "REGISTRATIONS", title: "ADMIN_REGISTRATIONS", icon: "bi-person-plus" },
            { type: "USERS", title: "ADMIN_USERS", icon: "bi-people" }
        ] as const;
        tasks.forEach(task => {
            const item = Controls.createElement(tabs, "li", "nav-item");
            const active = pageContext.administrationTab === task.type;
            const button = Controls.createButton(item, "button", "", `nav-link${active ? " active" : ""}`);
            button.setAttribute("aria-pressed", String(active));
            button.title = pageContext.locale.translate(task.title);
            button.setAttribute("aria-label", button.title);
            Controls.createSpan(button, `bi ${task.icon}`);
            button.addEventListener("click", async () => {
                pageContext.administrationTab = task.type;
                await pageContext.renderAsync();
            });
        });
        if (pageContext.administrationTab === "REGISTRATIONS") {
            await new RegistrationRequests().renderAsync(parent, pageContext, token);
        } else {
            await new ManagedUsers().renderAsync(parent, pageContext, token, user.id);
        }
    }
}
