import { PageContext } from "../PageContext";
import { Controls } from "../Controls";
import { UserInfoResult } from "../TypeDefinitions";

export class Inbox {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("INBOX"));
        const welcomeMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        welcomeMessage.textContent = pageContext.getLocale().translateWithArgs("MESSAGE_WELCOME_1", [userInfo.name]);
    }
}