import { PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
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

    override isActive(pageContext: PageContext): boolean {
        return false;
    }
}