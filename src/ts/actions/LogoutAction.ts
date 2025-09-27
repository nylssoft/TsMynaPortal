import { PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { SwitchPageClickAction } from "./SwitchPageAction";

/**
 * Action to log out the user.
 */
export class LogoutAction extends SwitchPageClickAction {

    constructor() {
        super("LOGIN_USERNAME_PASSWORD");
    }

    override async beforeRunAsync(e: MouseEvent, pageContext: PageContext): Promise<PageType> {
        await pageContext.authenticationClient.logoutAsync();
        return this.switchPage;
    }

    override async afterRunAsync(pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translate("INFO_LOGOUT_SUCCESS"), "alert-success");
    }

    override isActive(pageContext: PageContext): boolean {
        return false;
    }
}