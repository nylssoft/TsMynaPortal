import { PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { SwitchPageClickAction } from "./SwitchPageAction";

/**
 * Action to show the login page.
 */
export class ShowLoginPageAction extends SwitchPageClickAction {

    constructor() {
        super("LOGIN_USERNAME_PASSWORD");
    }

    async beforeRunAsync(e: MouseEvent, pageContext: PageContext): Promise<PageType> {
        if (pageContext.authenticationClient.isRequiresPin()) {
            return "LOGIN_PIN";
        }
        if (pageContext.authenticationClient.isRequiresPass2()) {
            return "LOGIN_PASS2";
        }
        return this.switchPage;
    }

    isActive(pageContext: PageContext): boolean {
        return this.switchPage === pageContext.pageType || pageContext.pageType === "LOGIN_PIN" || pageContext.pageType === "LOGIN_PASS2";
    }
}
