import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { RegistrationRequests } from "./RegistrationRequests";

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
        await new RegistrationRequests().renderAsync(parent, pageContext, token);
    }
}
